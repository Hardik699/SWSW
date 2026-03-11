import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucketName = import.meta.env.VITE_SUPABASE_BUCKET || "Infoseum";

let supabase: any = null;

function getSupabaseClient() {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase credentials");
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload
 * @param folderPath - Folder path in storage (e.g., "documents/aadhaar")
 * @returns Public URL of uploaded file
 */
export const uploadFileToSupabase = async (
  file: File,
  folderPath: string,
): Promise<string> => {
  try {
    console.log('Starting Supabase upload:', { fileName: file.name, folderPath, bucketName });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials are not configured. Please check your .env file.");
    }
    
    const client = getSupabaseClient();
    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${folderPath}/${fileName}`;

    console.log('Uploading to path:', filePath);

    // Upload to Supabase Storage
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('Upload successful, getting public URL');

    // Get public URL
    const { data: publicUrlData } = client.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }
};

/**
 * Upload a base64 file to Supabase Storage
 * @param base64Data - Base64 encoded file data
 * @param folderPath - Folder path in storage
 * @param fileName - Name of the file
 * @returns Public URL of uploaded file
 */
export const uploadBase64ToSupabase = async (
  base64Data: string,
  folderPath: string,
  fileName: string,
): Promise<string> => {
  try {
    const client = getSupabaseClient();
    // Convert base64 to blob
    const byteCharacters = atob(base64Data.split(",")[1] || base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/octet-stream" });

    // Create unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const filePath = `${folderPath}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(filePath, blob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = client.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param filePath - File path in storage
 */
export const deleteFileFromSupabase = async (filePath: string) => {
  try {
    const client = getSupabaseClient();
    const { error } = await client.storage.from(bucketName).remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error("Supabase delete error:", error);
    throw error;
  }
};
