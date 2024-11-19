namespace Application.ModelViews.WeighingSchedule
{
    public class WeighingScheduleModelView
    {
        public string Id { get; set; }
        public string AreaId { get; set; }
        public string AreaName { get; set; }
        public int TimesPerWeek { get; set; }
        public List<int> WeighingDays { get; set; }  // [2,5]
        public string WeighingDaysText { get; set; }  // "Thứ 2, Thứ 5"
        public bool IsActive { get; set; }
        public string Status => IsActive ? "Đang áp dụng" : "Ngưng áp dụng";
        public DateTimeOffset StartDate { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedByName { get; set; }
        public string Description { get; set; }
    }
}