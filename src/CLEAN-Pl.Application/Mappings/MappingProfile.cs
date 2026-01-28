using AutoMapper;
using CLEAN_Pl.Application.DTOs.Product;
using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Product mappings
        CreateMap<Product, ProductDto>();
        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>();
    }
}