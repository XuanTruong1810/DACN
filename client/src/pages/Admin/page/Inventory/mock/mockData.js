export const mockSuppliers = [
    {
        id: 1,
        name: "Công ty TNHH Thức ăn chăn nuôi ABC",
        code: "NCC001",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        phone: "0123456789",
        email: "abc@supplier.com",
        taxCode: "0123456789",
        representative: "Nguyễn Văn A"
    },
    {
        id: 2,
        name: "Công ty TNHH Thức ăn chăn nuôi XYZ",
        code: "NCC002",
        address: "456 Đường XYZ, Quận 2, TP.HCM",
        phone: "0987654321",
        email: "xyz@supplier.com",
        taxCode: "0987654321",
        representative: "Trần Thị B"
    },
    // Thêm nhiều nhà cung cấp khác...
];

export const mockBills = [
    {
        id: "PN001",
        createdAt: "2024-03-15 09:30",
        createdBy: "Nguyễn Văn A",
        area: "Khu A",
        status: "pending",
        totalAmount: 15000000,
        totalItems: 3,
        items: [
            {
                id: 1,
                name: "Thức ăn heo con C100",
                quantity: 500,
                unit: "kg",
                price: 15000,
                total: 7500000,
            },
            {
                id: 2,
                name: "Thức ăn heo thịt G100",
                quantity: 300,
                unit: "kg",
                price: 12000,
                total: 3600000,
            },
            {
                id: 3,
                name: "Thức ăn heo nái",
                quantity: 400,
                unit: "kg",
                price: 13500,
                total: 5400000,
            },
        ],
        note: "Nhập bổ sung cho tuần tới",
        history: [
            {
                action: "create",
                time: "2024-03-15 09:30",
                user: "Nguyễn Văn A",
                note: "Tạo phiếu"
            }
        ]
    },
    // Thêm nhiều phiếu khác...
];

export const mockAreas = [
    {
        id: 1,
        name: "Khu A",
        description: "Khu vực chăn nuôi heo con"
    },
    {
        id: 2,
        name: "Khu B",
        description: "Khu vực chăn nuôi heo thịt"
    },
    {
        id: 3,
        name: "Khu C",
        description: "Khu vực chăn nuôi heo nái"
    },
    // Thêm nhiều khu vực khác...
];
