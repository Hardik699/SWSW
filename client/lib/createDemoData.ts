import { Asset, nextWxId } from "./systemAssets";

export function createDemoSystemAssets(): Asset[] {
  const today = new Date().toISOString();
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  const warranty = oneYearLater.toISOString();

  const categories = [
    { name: "mouse", count: 12 },
    { name: "keyboard", count: 12 },
    { name: "motherboard", count: 12 },
    { name: "ram", count: 12 },
    { name: "power-supply", count: 12 },
    { name: "headphone", count: 12 },
    { name: "camera", count: 12 },
    { name: "monitor", count: 12 },
    { name: "storage", count: 12 },
    { name: "vonage", count: 2 },
  ];

  const demoAssets: Asset[] = [];

  categories.forEach((cat) => {
    for (let i = 1; i <= cat.count; i++) {
      const asset: Asset = {
        id: "", // Will be set below
        category: cat.name,
        serialNumber: `${cat.name.toUpperCase()}-SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        vendorName: getVendorForCategory(cat.name, i),
        companyName: i % 2 === 0 ? "Tech Solutions Inc" : "Business Corp",
        purchaseDate: "2024-01-01",
        warrantyEndDate: warranty,
        createdAt: today,
      };

      // Set category specific fields
      if (cat.name === "vonage") {
        asset.vonageNumber = `+1-555-${100 + i}-${2000 + i}`;
        asset.vonageExtCode = `${100 + i}`;
        asset.vonagePassword = `pass${100 + i}!`;
      } else if (cat.name === "ram") {
        asset.ramSize = i % 2 === 0 ? "16GB" : "8GB";
        asset.ramType = "DDR4";
      } else if (cat.name === "motherboard") {
        asset.processorModel = i % 2 === 0 ? "Intel i7" : "Intel i5";
      } else if (cat.name === "storage") {
        asset.storageType = i % 2 === 0 ? "SSD" : "HDD";
        asset.storageCapacity = i % 2 === 0 ? "512GB" : "1TB";
      }

      // Generate ID
      asset.id = nextWxId([...demoAssets], cat.name);
      demoAssets.push(asset);
    }
  });

  return demoAssets;
}

function getVendorForCategory(category: string, index: number): string {
  const vendors: Record<string, string[]> = {
    mouse: ["Logitech", "Razer", "SteelSeries", "HP", "Dell"],
    keyboard: ["Corsair", "Logitech", "Keychron", "HP", "Dell"],
    motherboard: ["ASUS", "MSI", "Gigabyte", "ASRock"],
    ram: ["Corsair", "Kingston", "G.Skill", "Crucial"],
    "power-supply": ["EVGA", "Corsair", "Seasonic", "Cooler Master"],
    headphone: ["Sony", "Bose", "Sennheiser", "Audio-Technica"],
    camera: ["Logitech", "Sony", "Canon", "Microsoft"],
    monitor: ["Dell", "LG", "Samsung", "ASUS", "HP"],
    vonage: ["Vonage"],
    storage: ["Samsung", "Western Digital", "Seagate", "Crucial"],
  };

  const list = vendors[category] || ["Generic"];
  return list[index % list.length];
}

export function loadDemoData() {
  const demoAssets = createDemoSystemAssets();
  console.log("Demo system assets generated:", demoAssets.length);
  return demoAssets;
}
