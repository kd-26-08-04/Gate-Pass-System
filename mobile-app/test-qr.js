#!/usr/bin/env node

// Test QR code generation using the same method as the app
const testQRGeneration = () => {
  console.log('🔍 Testing QR Code Generation...\n');

  // Sample gate pass data (same structure as in the app)
  const gatePassData = {
    _id: '507f1f77bcf86cd799439011',
    studentName: 'John Doe',
    studentUSN: '1XX21CS001',
    department: 'Computer Science',
    status: 'approved',
    destination: 'Home',
    exitTime: new Date().toISOString(),
    expectedReturnTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    approvalDate: new Date().toISOString(),
    approvedBy: 'Dr. Smith'
  };

  // Generate QR data (same as in QRCodeDisplay component)
  const qrData = JSON.stringify({
    type: 'GATE_PASS',
    gatePassId: gatePassData._id,
    studentName: gatePassData.studentName,
    studentUSN: gatePassData.studentUSN,
    department: gatePassData.department,
    status: gatePassData.status,
    destination: gatePassData.destination,
    exitTime: gatePassData.exitTime,
    expectedReturnTime: gatePassData.expectedReturnTime,
    approvalDate: gatePassData.approvalDate,
    approvedBy: gatePassData.approvedBy,
    verificationCode: gatePassData._id.slice(-8).toUpperCase(),
    timestamp: new Date().toISOString(),
    version: '1.0'
  });

  // Generate QR code URL (same as in the app)
  const encodedData = encodeURIComponent(qrData);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedData}&format=png&margin=10`;

  console.log('✅ QR Data Generated:');
  console.log(JSON.stringify(JSON.parse(qrData), null, 2));
  console.log('\n✅ QR Code URL Generated:');
  console.log(qrCodeUrl);
  console.log('\n✅ Verification Code:', gatePassData._id.slice(-8).toUpperCase());
  
  console.log('\n🎉 QR Code generation test completed successfully!');
  console.log('📱 The mobile app will use this exact method to generate QR codes.');
  console.log('🔗 You can test the QR code by opening the URL in a browser.');
};

testQRGeneration();