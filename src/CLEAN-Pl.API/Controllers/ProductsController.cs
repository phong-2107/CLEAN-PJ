using CLEAN_Pl.API.Attributes;
using CLEAN_Pl.Application.Common;
using CLEAN_Pl.Application.DTOs.Product;
using CLEAN_Pl.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CLEAN_Pl.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController(
    IProductService productService,
    ILogger<ProductsController> logger) : ControllerBase
{
    #region Public Endpoints (Anonymous Access)

    /// <summary>
    /// Lấy danh sách products có phân trang
    /// </summary>
    [HttpGet("paged")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetPaged(
        [FromQuery] ProductQueryParameters parameters,
        CancellationToken ct = default)
    {
        var result = await productService.GetPagedAsync(parameters, ct);
        return Ok(result);
    }

    /// <summary>
    /// Lấy tất cả products
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<ProductDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll(CancellationToken ct = default)
    {
        var products = await productService.GetAllAsync(ct);
        return Ok(products);
    }

    /// <summary>
    /// Lấy chi tiết product theo ID
    /// </summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDto>> GetById(int id, CancellationToken ct = default)
    {
        var product = await productService.GetByIdAsync(id, ct);
        if (product == null)
            return NotFound();

        return Ok(product);
    }

    #endregion

    #region Protected Endpoints (Require Authentication + Permission)

    /// <summary>
    /// Tạo product mới
    /// </summary>
    [HttpPost]
    [Permission("Product.Create")]
    [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ProductDto>> Create(
        [FromBody] CreateProductDto dto,
        CancellationToken ct = default)
    {
        var product = await productService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    /// <summary>
    /// Cập nhật product 
    /// </summary>
    [HttpPut("{id:int}")]
    [Permission("Product.Update")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateProductDto dto,
        CancellationToken ct = default)
    {
        await productService.UpdateAsync(id, dto, ct);
        return NoContent();
    }

    /// <summary>
    /// Xóa product 
    /// </summary>
    [HttpDelete("{id:int}")]
    [Permission("Product.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        await productService.DeleteAsync(id, ct);
        return NoContent();
    }

    #endregion
}