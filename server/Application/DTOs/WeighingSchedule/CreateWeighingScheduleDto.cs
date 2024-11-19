using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.WeighingSchedule
{
    public class CreateWeighingScheduleDto
    {
        [Required(ErrorMessage = "Khu vực là bắt buộc")] // ID khu vực
        public string AreaId { get; set; }

        [Required(ErrorMessage = "Số lần cân mỗi tuần là bắt buộc")]
        [Range(1, 7, ErrorMessage = "Số lần cân mỗi tuần phải từ 1 đến 7")] // Số lần cân mỗi tuần
        public int TimesPerWeek { get; set; }

        [Required(ErrorMessage = "Ngày cân là bắt buộc")] // Ngày cân
        public List<int> WeighingDays { get; set; }  // VD: [2,5] cho thứ 2 và thứ 5

        public string Description { get; set; }
    }

    public class UpdateWeighingScheduleDto
    {
        [Required(ErrorMessage = "ID là bắt buộc")] // ID
        public string Id { get; set; }

        public int TimesPerWeek { get; set; } // Số lần cân mỗi tuần
        public List<int> WeighingDays { get; set; } // Ngày cân
        public bool IsActive { get; set; } // Trạng thái
        public string Description { get; set; } // Ghi chú
    }
}