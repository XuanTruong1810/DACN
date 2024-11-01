export const mockBills = [
    {
        id: "PN001",
        createdAt: "2024-03-15 09:30",
        supplier: {
            id: 1,
            name: "Công ty TNHH Thức ăn chăn nuôi ABC",
            code: "NCC001",
            address: "123 Đường ABC, Quận 1, TP.HCM",
            phone: "0123456789",
            email: "abc@supplier.com",
        },
        items: [
            {
                id: 1,
                name: "Thức ăn heo con C100",
                quantity: 500,
                unit: "kg",
                price: 15000,
            },
            {
                id: 2,
                name: "Thức ăn heo thịt G100",
                quantity: 300,
                unit: "kg",
                price: 12000,
            },
        ],
        totalAmount: 12600000,
        deposit: 5000000,
        status: "pending",
        note: "Giao hàng trong tuần",
    },
    // Thêm nhiều mock data khác...
];
