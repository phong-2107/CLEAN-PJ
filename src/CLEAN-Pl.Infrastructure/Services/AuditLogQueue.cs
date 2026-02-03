using System.Threading.Channels;
using CLEAN_Pl.Domain.Entities;

namespace CLEAN_Pl.Infrastructure.Services;

public sealed class AuditLogQueue
{
    private readonly Channel<AuditLog> _channel;

    public AuditLogQueue()
    {
        var options = new BoundedChannelOptions(capacity: 10_000)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleReader = true,
            SingleWriter = false
        };

        _channel = Channel.CreateBounded<AuditLog>(options);
    }

    public async ValueTask EnqueueAsync(AuditLog auditLog, CancellationToken ct = default)
    {
        await _channel.Writer.WriteAsync(auditLog, ct);
    }

    public async ValueTask EnqueueRangeAsync(IEnumerable<AuditLog> auditLogs, CancellationToken ct = default)
    {
        foreach (var log in auditLogs)
        {
            await _channel.Writer.WriteAsync(log, ct);
        }
    }

    public IAsyncEnumerable<AuditLog> ReadAllAsync(CancellationToken ct = default)
    {
        return _channel.Reader.ReadAllAsync(ct);
    }

    public int Count => _channel.Reader.Count;

    public void Complete() => _channel.Writer.Complete();
}
