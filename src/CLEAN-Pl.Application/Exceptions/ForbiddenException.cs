namespace CLEAN_Pl.Application.Exceptions;

/// <summary>
/// Exception thrown when an operation is forbidden due to business rules
/// </summary>
public class ForbiddenException : BusinessRuleException
{
    public ForbiddenException(string message) : base(message)
    {
    }

    public ForbiddenException(string message, Exception innerException) 
        : base(message, innerException)
    {
    }
}
