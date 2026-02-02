namespace CLEAN_Pl.Domain.Constants;

public static class SystemConstants
{
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string User = "User";
        public const string Manager = "Manager";
    }

    public static class Actions
    {
        public const string Create = "Create";
        public const string Read = "Read";
        public const string Update = "Update";
        public const string Delete = "Delete";

        public static readonly string[] Crud = ["Create", "Read", "Update", "Delete"];
    }
    public const string SystemSource = "System";
}