interface PayslipData {
  // Header Info
  companyName: string;
  companyAddress: string;
  
  // Employee Details
  employeeName: string;
  uanNo: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  employeeCode: string;
  esicNo: string;
  bankAccountNo: string;
  daysInMonth: number;
  
  // Leave Details
  leaves: {
    type: string;
    total: number;
    availed: number;
    subsisting: number;
    lwp: number;
  }[];
  totalLeavesTaken: number;
  totalLeaveWithoutPay: number;
  totalPresentDays: number;
  totalDaysPayable: number;
  
  // Salary Details
  earnings: {
    name: string;
    actualGross: number;
    earnedGross: number;
  }[];
  deductions: {
    name: string;
    amount: number;
  }[];
  grossEarnings: number;
  earnedGrossEarnings: number;
  totalDeduction: number;
  netSalaryCredited: number;
  
  // Additional Info
  month: number;
  year: number;
  amountInWords: string;
}

export function Payslip({ data }: { data: PayslipData }) {
  const monthName = new Date(data.year, data.month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  const formatCurrency = (value: number) => {
    return Math.abs(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Unified centering style for all table cells - darker and bolder
  const cellCenteringStyle: React.CSSProperties = {
    verticalAlign: 'middle',
    textAlign: 'center',
    padding: '12px 8px',
    lineHeight: '1.2',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    color: '#000000',
  };

  const headerCenteringStyle: React.CSSProperties = {
    ...cellCenteringStyle,
    fontWeight: '800',
    backgroundColor: '#4a86e8',
    color: '#ffffff',
    fontSize: '14px',
    textTransform: 'uppercase',
  };

  const labelCellStyle: React.CSSProperties = {
    ...cellCenteringStyle,
    backgroundColor: '#ffffff',
    fontWeight: '700',
    color: '#000000',
    textAlign: 'left',
    paddingLeft: '15px'
  };

  const totalRowStyle: React.CSSProperties = {
    ...cellCenteringStyle,
    backgroundColor: '#d9e9ff',
    fontWeight: '800',
    color: '#000000',
  };

  const netSalaryRowStyle: React.CSSProperties = {
    ...cellCenteringStyle,
    backgroundColor: '#1c4587',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '16px'
  };

  return (
    <div className="w-full p-0" style={{fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', lineHeight: '1.5', fontSize: '15px', backgroundColor: '#ffffff', minHeight: '100vh'}}>
      <style>{`
        table td, table th {
          vertical-align: middle !important;
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <div className="w-full p-0" style={{fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', fontSize: '15px', backgroundColor: '#ffffff', lineHeight: '1.5'}}>
      
      {/* Header Section with White Background and Blue Text */}
      <div style={{ backgroundColor: '#ffffff', padding: '30px 20px', marginBottom: '30px', borderBottom: '4px solid #1e40af' }}>
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{ fontSize: '32px', margin: '0 0 8px 0', fontWeight: '800', color: '#1e40af', letterSpacing: '0.5px' }}>{data.companyName}</h1>
          <p style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#000000', lineHeight: '1.6', fontWeight: '600' }}>{data.companyAddress}</p>
          <div style={{ display: 'inline-block', backgroundColor: '#ffffff', padding: '8px 24px', borderRadius: '6px', marginTop: '8px' }}>
            <p style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: '#3b82f6' }}>Pay Check - {monthName}</p>
          </div>
        </div>
      </div>

      {/* Employee Details Section */}
      <div style={{ marginBottom: '30px', padding: '0 20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e40af', marginBottom: '16px', borderBottom: '3px solid #3b82f6', paddingBottom: '8px' }}>Employee Information</h2>
        <table className="w-full border-collapse" style={{fontSize: '16px', fontWeight: '600', fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
          <tbody>
            <tr>
              <td className="border border-gray-700" style={labelCellStyle}>Name:</td>
              <td className="border border-gray-700" style={cellCenteringStyle}>{data.employeeName}</td>
              <td className="border border-gray-700" style={labelCellStyle}>UAN No.:</td>
              <td className="border border-gray-700" style={cellCenteringStyle}>{data.uanNo}</td>
            </tr>
            <tr>
              <td className="border border-gray-700" style={labelCellStyle}>Department:</td>
              <td className="border border-gray-700" style={cellCenteringStyle}>{data.department}</td>
              <td className="border border-gray-700" style={labelCellStyle}>ESIC No.:</td>
              <td className="border border-gray-700" style={cellCenteringStyle}>{data.esicNo}</td>
            </tr>
            <tr>
              <td className="border border-gray-700" style={labelCellStyle}>Designation:</td>
              <td className="border border-gray-700" style={cellCenteringStyle}>{data.designation}</td>
              <td className="border border-gray-700" style={labelCellStyle}>Bank A/C No.:</td>
              <td className="border border-gray-700" style={cellCenteringStyle}>{data.bankAccountNo}</td>
            </tr>
            <tr>
              <td className="border border-gray-700" style={labelCellStyle}>Date Of Joining:</td>
              <td className="border border-gray-700" style={cellCenteringStyle}>{data.dateOfJoining}</td>
              <td className="border border-gray-700" style={labelCellStyle}>Days In Month:</td>
              <td className="border border-gray-700" style={cellCenteringStyle}>{data.daysInMonth}</td>
            </tr>
            <tr>
              <td className="border border-gray-700" style={labelCellStyle}>Employee Code:</td>
              <td className="border border-gray-700" style={cellCenteringStyle}>{data.employeeCode}</td>
              <td className="border border-gray-700" colSpan={2} style={{...cellCenteringStyle, backgroundColor: '#f8fafc'}}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Leave Details Section */}
      <div style={{ marginBottom: '30px', padding: '0 20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e40af', marginBottom: '16px', borderBottom: '3px solid #3b82f6', paddingBottom: '8px' }}>Leave Details</h2>
        <table className="w-full border-collapse" style={{fontSize: '16px', fontWeight: '600', fontFamily: '"Inter", "Segoe UI", Arial, sans-serif', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
          <thead>
            <tr>
              <th className="border border-gray-700" style={{...headerCenteringStyle, width: '20%'}}>Leave Type</th>
              <th className="border border-gray-700" style={{...headerCenteringStyle, width: '20%'}}>Total Leave In The Account</th>
              <th className="border border-gray-700" style={{...headerCenteringStyle, width: '20%'}}>Leave Availed</th>
              <th className="border border-gray-700" style={{...headerCenteringStyle, width: '20%'}}>Subsisting Leave</th>
              <th className="border border-gray-700" style={{...headerCenteringStyle, width: '20%'}}>LWP</th>
            </tr>
          </thead>
          <tbody>
            {data.leaves.map((leave, idx) => (
              <tr key={`leave-${idx}`}>
                <td className="border border-gray-700" style={labelCellStyle}>{leave.type}</td>
                <td className="border border-gray-700" style={cellCenteringStyle}>{leave.total.toFixed(1)}</td>
                <td className="border border-gray-700" style={{...cellCenteringStyle, color: leave.availed > 0 ? '#dc2626' : '#000000'}}>{leave.availed.toFixed(1)}</td>
                <td className="border border-gray-700" style={cellCenteringStyle}>{leave.subsisting.toFixed(1)}</td>
                <td className="border border-gray-700" style={cellCenteringStyle}>{leave.lwp.toFixed(1)}</td>
              </tr>
            ))}
            <tr style={{backgroundColor: '#d9e9ff'}}>
              <td className="border border-gray-700" style={{...labelCellStyle, fontWeight: '800'}}>Total Leaves Taken</td>
              <td className="border border-gray-700" style={{...cellCenteringStyle, fontWeight: '800'}}>{data.totalLeavesTaken.toFixed(1)}</td>
              <td colSpan={2} className="border border-gray-700" style={{...labelCellStyle, fontWeight: '800', textAlign: 'center'}}>Total Leave Without Pay</td>
              <td className="border border-gray-700" style={{...cellCenteringStyle, fontWeight: '800'}}>{data.totalLeaveWithoutPay.toFixed(1)}</td>
            </tr>
            <tr style={{backgroundColor: '#d9e9ff'}}>
              <td className="border border-gray-700" style={{...labelCellStyle, fontWeight: '800'}}>Total Present Days</td>
              <td className="border border-gray-700" style={{...cellCenteringStyle, fontWeight: '800'}}>{data.totalPresentDays.toFixed(1)}</td>
              <td colSpan={2} className="border border-gray-700" style={{...labelCellStyle, fontWeight: '800', textAlign: 'center'}}>Total Days Payable</td>
              <td className="border border-gray-700" style={{...cellCenteringStyle, fontWeight: '800'}}>{data.totalDaysPayable.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Salary Details Table */}
      <div style={{ marginBottom: '30px', padding: '0 20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1e40af', marginBottom: '16px', borderBottom: '3px solid #3b82f6', paddingBottom: '8px' }}>Salary Details</h2>
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-400" style={{...headerCenteringStyle, width: '25%'}}>Earning</th>
              <th className="border border-gray-400" style={{...headerCenteringStyle, width: '18%'}}>Actual</th>
              <th className="border border-gray-400" style={{...headerCenteringStyle, width: '18%'}}>Earned</th>
              <th className="border border-gray-400" style={{...headerCenteringStyle, width: '20%'}}>Deduction</th>
              <th className="border border-gray-400" style={{...headerCenteringStyle, width: '19%'}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.earnings.map((earning, idx) => (
              <tr key={`earning-${idx}`}>
                <td className="border border-gray-400" style={labelCellStyle}>{earning.name}</td>
                <td className="border border-gray-400" style={cellCenteringStyle}>{formatCurrency(earning.actualGross || 0)}</td>
                <td className="border border-gray-400" style={cellCenteringStyle}>{formatCurrency(earning.earnedGross || 0)}</td>
                <td className="border border-gray-400" style={labelCellStyle}>
                  {data.deductions[idx]?.name || ''}
                </td>
                <td className="border border-gray-400" style={cellCenteringStyle}>
                  {data.deductions[idx]?.amount !== undefined ? formatCurrency(data.deductions[idx].amount) : (data.deductions[idx] ? formatCurrency(0) : '')}
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-gray-400" style={{...totalRowStyle, textAlign: 'left', paddingLeft: '15px'}}>Gross Earnings</td>
              <td className="border border-gray-400" style={totalRowStyle}>{formatCurrency(data.grossEarnings)}</td>
              <td className="border border-gray-400" style={totalRowStyle}>{formatCurrency(data.earnedGrossEarnings)}</td>
              <td className="border border-gray-400" style={{...totalRowStyle, textAlign: 'left', paddingLeft: '15px'}}>Total Deduction</td>
              <td className="border border-gray-400" style={totalRowStyle}>{formatCurrency(data.totalDeduction)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="border border-gray-400" style={netSalaryRowStyle}>Net Salary Credited</td>
              <td colSpan={2} className="border border-gray-400" style={netSalaryRowStyle}>₹ {formatCurrency(data.netSalaryCredited)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="border border-gray-400" style={{...labelCellStyle, textAlign: 'center', padding: '15px'}}>Amount (in words)</td>
              <td colSpan={2} className="border border-gray-400" style={{...cellCenteringStyle, fontStyle: 'italic', color: '#38761d', fontWeight: 'bold'}}>{data.amountInWords}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ padding: '30px 20px', textAlign: 'center', borderTop: '2px solid #e5e7eb', marginTop: '40px' }}>
        <img src="https://cdn.builder.io/api/v1/image/assets%2F8012cbea6d4a4d528be55b21ebc4390f%2F5e57f6b47c4249638a8470815ec3ca60?format=webp&width=800&height=1200" alt="Infoseum Logo" className="mx-auto mb-3" style={{height: '70px', width: 'auto'}} />
        <p style={{fontSize: '12px', color: '#6b7280', fontStyle: 'italic'}}>This is a system generated slip</p>
      </div>
      </div>
    </div>
  );
}
