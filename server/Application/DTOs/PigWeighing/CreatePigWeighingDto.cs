using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.PigWeighing
{
    public class CreatePigWeighingDto
    {
        [Required]
        public string AreaId { get; set; } // ID khu vực
        public string Note { get; set; } // Ghi chú
    }

    public class AddWeighingDetailDto
    {
        [Required]
        public string WeighingId { get; set; } // ID phiếu cân

        [Required(ErrorMessage = "ID heo là bắt buộc")]
        public string PigId { get; set; } // ID heo

        [Required(ErrorMessage = "ID chuồng là bắt buộc")]
        public string StableId { get; set; } // ID chuồng

        [Required(ErrorMessage = "Cân nặng là bắt buộc")]
        [Range(0.1, 1000, ErrorMessage = "Cân nặng phải lớn hơn 0.1 và nhỏ hơn 1000")]
        public decimal Weight { get; set; } // Cân nặng

        public string Note { get; set; } // Ghi chú 
    }

    public class WeighingFilterDto
    {
        public string AreaId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string Status { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}