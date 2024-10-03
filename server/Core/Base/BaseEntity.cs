using System.ComponentModel.DataAnnotations;

public class BaseEntity
{
    [Required]
    [Key]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTimeOffset? CreatedTime { get; set; }
    public DateTimeOffset? UpdatedTime { get; set; }
    public DateTimeOffset? DeleteTime { get; set; }

    protected BaseEntity()
    {
        CreatedTime = DateTimeOffset.UtcNow;
    }
}