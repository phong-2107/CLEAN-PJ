using System.ComponentModel.DataAnnotations;

namespace CLEAN_Pl.Application.Common;
public class QueryParameters
{
    private const int MaxPageSize = 100;
    private int _pageSize = 20;

    [Range(1, int.MaxValue, ErrorMessage = "Page number must be at least 1")]
    public int PageNumber { get; set; } = 1;

    [Range(1, MaxPageSize, ErrorMessage = "Page size must be between 1 and 100")]
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }

    public string? SearchTerm { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = false;
}

public class UserQueryParameters : QueryParameters
{
    public bool? IsActive { get; set; }
    public int? RoleId { get; set; }
}

public class ProductQueryParameters : QueryParameters
{
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? IsActive { get; set; }
    public bool? InStock { get; set; }
}

public class RoleQueryParameters : QueryParameters
{
    public bool? IsActive { get; set; }
    public bool? IsSystemRole { get; set; }
}
