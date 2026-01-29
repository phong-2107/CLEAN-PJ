using CLEAN_Pl.Domain.Common;
using CLEAN_Pl.Domain.Exceptions;

namespace CLEAN_Pl.Domain.Entities;


public class Product : BaseEntity
{
    public string Name { get; private set; } = "";  
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }  
    public int StockQuantity { get; private set; }
    public bool IsActive { get; private set; }  


    private Product() { }


    public static Product Create(string name, string description, decimal price, int stockQuantity)
    {
        ValidateName(name);
        ValidatePrice(price);
        ValidateStockQuantity(stockQuantity);

        return new Product
        {
            Name = name,
            Description = description,
            Price = price,
            StockQuantity = stockQuantity,
            IsActive = true
        };
    }


    public void UpdateDetails(string name, string description, decimal price)
    {
        ValidateName(name);
        ValidatePrice(price);

        Name = name;
        Description = description;
        Price = price;
        SetUpdatedAt();
    }

    public void UpdateStock(int quantity)
    {
        ValidateStockQuantity(quantity);
        StockQuantity = quantity;
        SetUpdatedAt();
    }

    public void Activate()
    {
        IsActive = true;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }


    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Tên sản phẩm không được trống");

        if (name.Length > 200)
            throw new DomainException("Tên sản phẩm không quá 200 ký tự");
    }

    private static void ValidatePrice(decimal price)
    {
        if (price < 0)
            throw new DomainException("Giá không thể âm");
    }

    private static void ValidateStockQuantity(int quantity)
    {
        if (quantity < 0)
            throw new DomainException("Số lượng tồn kho không thể âm");
    }
}