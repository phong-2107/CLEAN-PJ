using CLEAN_Pl.Domain.Entities;
using CLEAN_Pl.Domain.Exceptions;

namespace CLEAN_Pl.UnitTests;

/// <summary>
/// Unit tests cho domain entities
/// Author: junior dev
/// Last update: sau khi fix bug #67 (emoji trong username)
/// </summary>
public class ProductTests
{
    [Fact]
    public void Create_WithValidData_ReturnsProduct()
    {
        // arrange & act
        var product = Product.Create("iPhone 15", "Điện thoại mới", 999.99m, 100);

        // assert
        Assert.Equal("iPhone 15", product.Name);
        Assert.Equal(999.99m, product.Price);
        Assert.True(product.IsActive); // mặc định phải active
    }

    [Fact]
    public void Create_WithNegativePrice_ThrowsDomainException()
    {
        // bug #45: khách hàng phản ánh thấy giá âm trên invoice
        // đã fix bằng cách thêm validation trong factory method
        Assert.Throws<DomainException>(() => 
            Product.Create("Test", "Description", -1m, 10));
    }

    [Fact]
    public void Create_WithEmptyName_ThrowsDomainException()
    {
        // edge case từ QA: form submit với name = "" khi JS validation bị disable
        var ex = Assert.Throws<DomainException>(() => 
            Product.Create("", "Desc", 10m, 10));
        
        Assert.Contains("required", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Create_WithNegativeStock_ThrowsDomainException()
    {
        // ai mà nhập stock âm bao giờ, nhưng vẫn phải check :D
        Assert.Throws<DomainException>(() => 
            Product.Create("Test", "Desc", 10m, -5));
    }

    [Fact]
    public void UpdateDetails_WithValidPrice_ShouldUpdateAll()
    {
        // arrange
        var product = Product.Create("Old Name", "Old desc", 100m, 50);

        // act
        product.UpdateDetails("New Name", "New desc", 200m);

        // assert
        Assert.Equal("New Name", product.Name);
        Assert.Equal(200m, product.Price);
        Assert.NotNull(product.UpdatedAt); // phải set UpdatedAt
    }

    [Fact]
    public void Deactivate_ShouldSetIsActiveToFalse()
    {
        var product = Product.Create("Test", "Desc", 10m, 10);
        Assert.True(product.IsActive); // confirm trước

        product.Deactivate();

        Assert.False(product.IsActive);
    }
}

public class UserTests
{
    [Fact]
    public void Create_WithValidData_ReturnsActiveUser()
    {
        var user = User.Create("testuser", "test@example.com", "hashedpassword123");

        Assert.Equal("testuser", user.Username);
        Assert.True(user.IsActive);
        Assert.False(user.EmailConfirmed); // mặc định chưa confirm
    }

    [Fact]
    public void Create_WithShortUsername_ThrowsDomainException()
    {
        // min length = 3, ticket #12: user cố đăng ký với username "ab"
        var ex = Assert.Throws<DomainException>(() => 
            User.Create("ab", "test@test.com", "hash"));
        
        Assert.Contains("3", ex.Message); // phải mention min length
    }

    [Fact]
    public void Create_WithInvalidEmail_ThrowsDomainException()
    {
        // email không đúng format
        Assert.Throws<DomainException>(() => 
            User.Create("validuser", "not-an-email", "hash"));
    }

    [Fact]
    public void Create_WithEmojiInUsername_ThrowsDomainException()
    {
        // bug #67: user gửi emoji 😀 trong username gây lỗi DB
        Assert.Throws<DomainException>(() => 
            User.Create("user😀name", "test@test.com", "hash"));
    }

    [Fact]
    public void FullName_WhenBothNamesNull_ReturnsUsername()
    {
        // edge case: user đăng ký không nhập tên
        var user = User.Create("testuser", "test@test.com", "hash");

        // FullName phải fallback về username nếu không có tên
        Assert.Equal("testuser", user.FullName);
    }

    [Fact]
    public void ChangePassword_ShouldUpdatePasswordHash()
    {
        var user = User.Create("testuser", "test@test.com", "oldhash");
        var originalUpdatedAt = user.UpdatedAt;

        user.ChangePassword("newhash");

        Assert.Equal("newhash", user.PasswordHash);
        Assert.NotEqual(originalUpdatedAt, user.UpdatedAt);
    }

    [Fact]
    public void SetRefreshToken_ShouldStoreTokenAndExpiry()
    {
        var user = User.Create("testuser", "test@test.com", "hash");
        var expiry = DateTime.UtcNow.AddDays(7);

        user.SetRefreshToken("refresh_token_123", expiry);

        Assert.Equal("refresh_token_123", user.RefreshToken);
        Assert.Equal(expiry, user.RefreshTokenExpiryTime);
    }

    [Fact]
    public void IsRefreshTokenValid_WhenExpired_ReturnsFalse()
    {
        var user = User.Create("testuser", "test@test.com", "hash");
        // set token hết hạn hôm qua
        user.SetRefreshToken("token", DateTime.UtcNow.AddDays(-1));

        Assert.False(user.IsRefreshTokenValid());
    }

    [Theory]
    [InlineData("user name")]    // có space
    [InlineData("user@name")]    // có @
    [InlineData("user-name")]    // có dash
    public void Create_WithInvalidUsernameCharacters_ThrowsDomainException(string invalidUsername)
    {
        // chỉ cho phép alphanumeric + underscore
        Assert.Throws<DomainException>(() => 
            User.Create(invalidUsername, "test@test.com", "hash"));
    }
}
