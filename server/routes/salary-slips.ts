import { Router, RequestHandler } from "express";
import { Employee } from "../models/Employee";
import { SalaryRecord } from "../models/SalaryRecord";
import { LeaveRecord } from "../models/LeaveRecord";
import archiver from "archiver";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import PDFDocument from "pdfkit";

const router = Router();

// Helper function to convert number to words
function convertNumberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero Rupees Only';
  let words = '';
  
  if (num >= 10000000) {
    words += convertNumberToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    words += convertNumberToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    words += convertNumberToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num >= 10) {
    words += teens[num - 10] + ' ';
    return words + 'Rupees Only';
  }
  if (num > 0) {
    words += ones[num] + ' ';
  }
  return words + 'Rupees Only';
}

// Generate HTML for payslip - exact same format as Payslip component
function generatePayslipHTML(employee: any, salaryRecord: any, leaveRecord: any, month: string): string {
  const formatCurrency = (val: number) => Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const monthDate = new Date(month + '-01');
  const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const leaves = [
    { type: 'PL', total: leaveRecord?.plTotalLeaveInAccount || 0, availed: leaveRecord?.plLeaveAvailed || 0, subsisting: leaveRecord?.plSubsistingLeave || 0, lwp: leaveRecord?.plLwp || 0 },
    { type: 'CL', total: leaveRecord?.clTotalLeaveInAccount || 0, availed: leaveRecord?.clLeaveAvailed || 0, subsisting: leaveRecord?.clSubsistingLeave || 0, lwp: leaveRecord?.clLwp || 0 },
    { type: 'SL', total: leaveRecord?.slTotalLeaveInAccount || 0, availed: leaveRecord?.slLeaveAvailed || 0, subsisting: leaveRecord?.slSubsistingLeave || 0, lwp: leaveRecord?.slLwp || 0 }
  ];

  const totalLeavesTaken = (leaveRecord?.plLeaveAvailed || 0) + (leaveRecord?.clLeaveAvailed || 0) + (leaveRecord?.slLeaveAvailed || 0);
  const totalLwp = (leaveRecord?.plLwp || 0) + (leaveRecord?.clLwp || 0) + (leaveRecord?.slLwp || 0);

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; line-height: 1.2; font-size: 9px; background: #fff; color: #000; padding: 12px 20px; }
table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 9px; font-weight: 600; }
th, td { border: 1px solid #374151; padding: 5px 4px; vertical-align: middle; text-align: center; line-height: 1.1; font-weight: 600; color: #000; }
th { background: #4a86e8; color: #fff; font-weight: 800; font-size: 9px; text-transform: uppercase; }
.label { background: #fff; font-weight: 700; text-align: center; }
.total-row { background: #d9e9ff; font-weight: 800; }
.net-salary { background: #1c4587; color: #fff; font-weight: 800; font-size: 10px; }
.amount-words { font-style: italic; color: #38761d; font-weight: bold; }
h2 { font-size: 12px; font-weight: 800; color: #1e40af; margin: 10px 0 5px; border-bottom: 2px solid #3b82f6; padding-bottom: 3px; }
</style></head><body>

<div style="background: #fff; padding: 10px 8px; margin-bottom: 8px; border-bottom: 3px solid #1e40af; text-align: center;">
  <h1 style="font-size: 16px; margin: 0 0 3px 0; font-weight: 800; color: #1e40af; letter-spacing: 0.5px;">INFOSEUM IT OPC PVT LTD.</h1>
  <p style="font-size: 8px; margin: 0 0 4px 0; color: #000; line-height: 1.3; font-weight: 600;">Imperial Heights -701, Near Akshar Chowk, Atladra, Vadodara-390012, Gujarat</p>
  <div style="display: inline-block; background: #fff; padding: 3px 10px; border-radius: 3px; margin-top: 3px;">
    <p style="font-size: 10px; margin: 0; font-weight: 700; color: #3b82f6;">Pay Check - ${monthName}</p>
  </div>
</div>

<h2>Employee Information</h2>
<table>
<tr><td class="label">Name:</td><td>${employee.fullName}</td><td class="label">UAN No.:</td><td>${employee.uanNumber || 'N/A'}</td></tr>
<tr><td class="label">Department:</td><td>${employee.department}</td><td class="label">ESIC No.:</td><td>${employee.esic || 'N/A'}</td></tr>
<tr><td class="label">Designation:</td><td>${employee.position}</td><td class="label">Bank A/C No.:</td><td>${employee.accountNumber || 'N/A'}</td></tr>
<tr><td class="label">Date Of Joining:</td><td>${employee.joiningDate || 'N/A'}</td><td class="label">Days In Month:</td><td>${salaryRecord.totalWorkingDays || 30}</td></tr>
<tr><td class="label">Employee Code:</td><td>${employee.employeeId}</td><td colspan="2" style="background: #f8fafc;"></td></tr>
</table>

<h2>Leave Details</h2>
<table>
<tr><th>Leave Type</th><th>Total Leave</th><th>Availed</th><th>Subsisting</th><th>LWP</th></tr>
${leaves.map(l => `<tr><td class="label">${l.type}</td><td>${l.total.toFixed(1)}</td><td style="color: ${l.availed > 0 ? '#dc2626' : '#000'};">${l.availed.toFixed(1)}</td><td>${l.subsisting.toFixed(1)}</td><td>${l.lwp.toFixed(1)}</td></tr>`).join('')}
<tr class="total-row"><td class="label">Total Leaves Taken</td><td>${totalLeavesTaken.toFixed(1)}</td><td colspan="2" class="label" style="text-align: center;">Total Leave Without Pay</td><td>${totalLwp.toFixed(1)}</td></tr>
<tr class="total-row"><td class="label">Total Present Days</td><td>${(salaryRecord.actualWorkingDays || 0).toFixed(1)}</td><td colspan="2" class="label" style="text-align: center;">Total Days Payable</td><td>${(salaryRecord.actualWorkingDays || 0).toFixed(1)}</td></tr>
</table>

<h2>Salary Details</h2>
<table>
<tr><th>Earning</th><th>Actual</th><th>Earned</th><th>Deduction</th><th>Amount</th></tr>
<tr><td class="label">Basic</td><td>${formatCurrency(salaryRecord.basic || 0)}</td><td>${formatCurrency(salaryRecord.basicEarned || 0)}</td><td class="label">PF</td><td>${formatCurrency(salaryRecord.pf || 0)}</td></tr>
<tr><td class="label">HRA</td><td>${formatCurrency(salaryRecord.hra || 0)}</td><td>${formatCurrency(salaryRecord.hraEarned || 0)}</td><td class="label">ESIC</td><td>${formatCurrency(salaryRecord.esic || 0)}</td></tr>
<tr><td class="label">Conveyance</td><td>${formatCurrency(salaryRecord.conveyance || 0)}</td><td>${formatCurrency(salaryRecord.conveyanceEarned || 0)}</td><td class="label">PT</td><td>${formatCurrency(salaryRecord.pt || 0)}</td></tr>
<tr><td class="label">Sp. Allowance</td><td>${formatCurrency(salaryRecord.specialAllowance || 0)}</td><td>${formatCurrency(salaryRecord.specialAllowanceEarned || 0)}</td><td class="label">Retention</td><td>${formatCurrency(salaryRecord.retention || 0)}</td></tr>
<tr><td class="label">Bonus</td><td>${formatCurrency(salaryRecord.bonus || 0)}</td><td>${formatCurrency(salaryRecord.bonusEarned || 0)}</td><td class="label"></td><td></td></tr>
<tr><td class="label">Incentive</td><td>${formatCurrency(salaryRecord.incentive || 0)}</td><td>${formatCurrency(salaryRecord.incentiveEarned || 0)}</td><td class="label"></td><td></td></tr>
<tr><td class="label">Adjustment</td><td>${formatCurrency(salaryRecord.adjustment || 0)}</td><td>${formatCurrency(salaryRecord.adjustmentEarned || 0)}</td><td class="label"></td><td></td></tr>
<tr><td class="label">Retention Bonus</td><td>0.00</td><td>0.00</td><td class="label"></td><td></td></tr>
<tr><td class="label">Advance Adj</td><td>0.00</td><td>0.00</td><td class="label"></td><td></td></tr>
<tr class="total-row"><td class="label" style="text-align: center;">Gross Earnings</td><td>${formatCurrency(salaryRecord.actualGross || 0)}</td><td>${formatCurrency(salaryRecord.earnedGross || 0)}</td><td class="label" style="text-align: center;">Total Deduction</td><td>${formatCurrency(salaryRecord.deductions || 0)}</td></tr>
<tr class="net-salary"><td colspan="3" style="color: #fff;">Net Salary Credited</td><td colspan="2" style="color: #fff;">₹ ${formatCurrency(salaryRecord.netSalary || 0)}</td></tr>
<tr><td colspan="3" class="label" style="text-align: center; padding: 6px;">Amount (in words)</td><td colspan="2" class="amount-words">${convertNumberToWords(Math.round(salaryRecord.netSalary || 0))}</td></tr>
</table>

<div style="padding: 10px 0; text-align: center; border-top: 1px solid #e5e7eb; margin-top: 10px;">
  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzFlNDBhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+aW5mb3NldW08L3RleHQ+PC9zdmc+" alt="Infoseum" style="height: 30px; margin: 5px 0;">
  <p style="font-size: 8px; color: #6b7280; font-style: italic; margin-top: 5px;">This is a system generated slip</p>
</div>

</body></html>`;
}

// Bulk download endpoint
const bulkDownloadSlips: RequestHandler = async (req, res) => {
  let browser;
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({ success: false, message: 'Month parameter required (YYYY-MM)' });
    }

    console.log(`Generating bulk slips for: ${month}`);
    const employees = await Employee.find({ status: 'active' });
    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No active employees' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    res.attachment(`All_Salary_Slips_${month}.zip`);
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    // Launch browser once for all employees (HUGE speed improvement)
    // Use chromium for serverless/cloud deployment compatibility
    browser = await puppeteer.launch({ 
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    let processed = 0, skipped = 0;
    
    // Process employees in batches of 3 for speed
    const batchSize = 3;
    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (employee) => {
        try {
          const salaryRecord = await SalaryRecord.findOne({ employeeId: employee._id.toString(), month });
          if (!salaryRecord) { 
            skipped++; 
            return; 
          }
          
          const leaveRecord = await LeaveRecord.findOne({ employeeId: employee._id.toString(), month });
          const html = generatePayslipHTML(employee, salaryRecord, leaveRecord, month);
          
          let password = String(employee.uanNumber || "1234").replace(/\D/g, '').slice(-4);
          if (password.length < 4) password = password.padStart(4, '0');
          
          // Create new page for this employee
          const page = await browser!.newPage();
          
          // Set viewport to portrait A4 with proper content fitting
          await page.setViewport({
            width: 595,  // A4 width in pixels at 72 DPI (portrait)
            height: 842, // A4 height in pixels at 72 DPI (portrait)
            deviceScaleFactor: 2  // Higher quality
          });
          
          await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 5000 });
          
          // Wait for content to render
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get actual content height to avoid blank space
          const contentHeight = await page.evaluate(() => {
            return document.body.scrollHeight;
          });
          
          // Use actual content height or A4 height, whichever is smaller
          const finalHeight = Math.min(contentHeight + 20, 842);
          
          const screenshot = await page.screenshot({ 
            type: 'jpeg',
            quality: 95,
            fullPage: false,
            clip: {
              x: 0,
              y: 0,
              width: 595,
              height: finalHeight
            }
          });
          await page.close();

          // Create PDF with password
          const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            const doc = new PDFDocument({
              size: "A4",
              userPassword: password,
              ownerPassword: password,
              permissions: {
                printing: "highResolution",
                copying: false,
                modifying: false,
              },
            });

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
            const pageWidth = doc.page.width - 40;
            const pageHeight = doc.page.height - 40;
            doc.image(screenshot, 20, 20, {
              fit: [pageWidth, pageHeight],
              align: "center",
              valign: "center",
            });
            doc.end();
          });

          archive.append(pdfBuffer, { name: `${employee.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_${month}.pdf` });
          processed++;
          console.log(`Processed: ${employee.fullName}`);
        } catch (error) {
          console.error(`Error: ${employee.fullName}`, error);
          skipped++;
        }
      }));
    }

    await browser.close();
    console.log(`Complete: ${processed} processed, ${skipped} skipped`);
    await archive.finalize();
  } catch (error) {
    if (browser) await browser.close();
    console.error('Bulk download error:', error);
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Failed' });
  }
};

router.get("/bulk-download", bulkDownloadSlips);
export { router as salarySlipsRouter };
