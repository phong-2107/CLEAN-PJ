namespace CLEAN_Pl.Application.Exceptions;

/// <summary>
/// Exception thrown when a duplicate entity is detected
/// </summary>
public class DuplicateException : BusinessRuleException
{
    public string EntityName { get; }
    public string PropertyName { get; }
    public object? PropertyValue { get; }

    public DuplicateException(string entityName, string propertyName, object? propertyValue)
        : base($"{entityName} with {propertyName} '{propertyValue}' already exists")
    {
        EntityName = entityName;
        PropertyName = propertyName;
        PropertyValue = propertyValue;
    }

    public DuplicateException(string message) : base(message)
    {
        EntityName = string.Empty;
        PropertyName = string.Empty;
    }
}
