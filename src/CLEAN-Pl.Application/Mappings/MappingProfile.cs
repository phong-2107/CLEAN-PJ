using AutoMapper;
using CLEAN_Pl.Application.DTOs.Auth;
using CLEAN_Pl.Application.DTOs.Category;
using CLEAN_Pl.Application.DTOs.Permission;
using CLEAN_Pl.Application.DTOs.Product;
using CLEAN_Pl.Application.DTOs.Role;
using CLEAN_Pl.Application.DTOs.User;
using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Product mappings
        CreateMap<Product, ProductDto>();
        CreateMap<Product, ProductListDto>();
        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>();
        CreateMap<Category, CategoryDto>();
        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Roles,
                opt => opt.MapFrom(src => src.UserRoles.Select(ur => ur.Role.Name)));
        
        CreateMap<User, UserListDto>();

        CreateMap<User, AuthResponseDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Roles,
                opt => opt.MapFrom(src => src.UserRoles.Select(ur => ur.Role.Name)))
            .ForMember(dest => dest.AccessToken, opt => opt.Ignore())
            .ForMember(dest => dest.RefreshToken, opt => opt.Ignore())
            .ForMember(dest => dest.TokenExpiresAt, opt => opt.Ignore());

        // Role mappings
        CreateMap<Role, RoleDto>()
            .ForMember(dest => dest.Permissions,
                opt => opt.MapFrom(src => src.RolePermissions.Select(rp => rp.Permission.GetPermissionString())));

        // Permission mappings
        CreateMap<Domain.Entities.Permission, PermissionDto>()
            .ForMember(dest => dest.PermissionString,
                opt => opt.MapFrom(src => src.GetPermissionString()));
    }
}