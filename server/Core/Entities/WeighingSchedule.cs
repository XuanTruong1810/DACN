using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Core.Entities
{
    public class WeighingSchedule : BaseEntity
    {
        public string AreaId { get; set; }
        [ForeignKey("AreaId")]
        public virtual Areas Area { get; set; }

        public int TimesPerWeek { get; set; }  // Số lần cân mỗi tuần
        public string WeighingDays { get; set; }  // VD: "2,5" cho thứ 2 và thứ 5
        public bool IsActive { get; set; } = true;
        public DateTimeOffset StartDate { get; set; }  // Ngày bắt đầu áp dụng lịch
        public DateTimeOffset? EndDate { get; set; }   // Ngày kết thúc (null = vô thời hạn)
        public string CreatedBy { get; set; }
        public string Description { get; set; }        // Mô tả thêm về lịch cân

        [NotMapped]
        public List<int> WeighingDaysList => WeighingDays?.Split(',').Select(int.Parse).ToList() ?? new List<int>();
    }
}