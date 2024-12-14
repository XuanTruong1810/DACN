import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import GlobalStyle from "./styles/GlobalStyle";

import AuthLayout from "./pages/Auth/AuthLayout";
import LoginPage from "./pages/Auth/page/LoginPage";
import ForgotPasswordPage from "./pages/Auth/page/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/page/ResetPasswordPage";
import HomePage from "./pages/Home/page/HomePage";
import VerifyOTPPage from "./pages/Auth/page/VerifyOTPPage";
import CreateHealthRecordPage from "./pages/Admin/page/CreateHealthRecordPage";
import SuppliersPage from "./pages/Admin/page/Suppliers/SuppliersPage";
import FoodCategoriesPage from "./pages/Admin/page/FoodCategories/FoodCategoriesPage";
import AreasPage from "./pages/Admin/page/Areas/AreasPage";
import HousesPage from "./pages/Admin/page/Houses/HousesPage";
import FoodsPage from "./pages/Admin/page/Foods/FoodsPage";
import DeadPigsPage from "./pages/Admin/page/DeadPigs/DeadPigsPage";
import PigImportApproval from "./pages/Admin/page/PigImport/PigImportApproval";
import PigImportRequest from "./pages/Admin/page/PigImport/PigImportRequest";
import ImportRequestManagement from "./pages/Admin/page/PigImport/ImportRequestManagement";
import EmployeeManagement from "./pages/Admin/page/Employee/EmployeeManagement";
import PigStatistics from "./pages/Admin/page/Statistics/PigStatistics";
import InventoryStatistics from "./pages/Admin/page/Statistics/InventoryStatistics";
import PerformanceStatistics from "./pages/Admin/page/Statistics/PerformanceStatistics";
import Profile from "./pages/Profile/Profile";
import FoodImport from "./pages/Admin/page/Inventory/FoodImport";
import FoodImportApproval from "./pages/Admin/page/Inventory/FoodImportApproval";
import FoodImportList from "./pages/Admin/page/Inventory/FoodImportList";
import DailyFoodExport from "./pages/Admin/page/Exports/DailyFoodExport";
import PigsManagement from "./pages/Admin/page/Pigs/PigsManagement";
import CreateExportRequest from "./pages/Admin/ExportRequest/CreateExportRequest";
import ExportRequestList from "./pages/Admin/ExportRequest/ExportRequestList";
import ExportList from "./pages/Admin/Export/ExportList";
import CustomerManagement from "./pages/Admin/page/Customer/CustomerManagement";
import MoveHouse from "./pages/Admin/page/Animals/MoveHouse";
import MedicinePage from "./pages/Admin/Medicine/MedicinePage";
import MedicineRequestPage from "./pages/Admin/Medicine/MedicineRequestPage";
import MedicineRequestApproval from "./pages/Admin/Medicine/MedicineRequestApproval ";
import MedicineImportList from "./pages/Admin/Medicine/MedicineImportList";
import MedicineSchedule from "./pages/Admin/MedicineSchedule/MedicineSchedule";
import VaccinationForm from "./pages/Admin/Health/VaccinationForm";
import Restore from "./pages/Admin/Restore/Restore";
import AdminLayout from "./pages/Admin/AdminLayout";
import FeedManagerLayout from "./pages/Admin/FeedManagerLayout";
import DispatchLayout from "./pages/Admin/DispatchLayout";
import VeterinarianLayout from "./pages/Admin/VeterinarianLayout";
import Forbidden from "./pages/Error/Forbidden";
import NotFound from "./pages/Error/NotFound";
import Unauthorized from "./pages/Error/Unauthorized";
import WeighingSchedule from "./pages/Admin/Schedule/WeighingSchedule";
import VaccinationHistory from "./pages/Admin/VaccinationHistory/VaccinationHistory";
import DailyFoodHistory from "./pages/Admin/page/Exports/DailyFoodHistory";
import HealthRecordHistory from "./pages/Admin/page/HealthRecordHistory";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/Admin" element={<AdminLayout />}>
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route
              path="inventory/food-categories"
              element={<FoodCategoriesPage />}
            />
            <Route path="inventory/food-imports" element={<FoodImportList />} />
            <Route path="restore" element={<Restore />} />
            <Route path="Areas" element={<AreasPage />} />
            <Route path="Houses" element={<HousesPage />} />
            <Route path="inventory/foods" element={<FoodsPage />} />
            <Route path="inventory/medicines" element={<MedicinePage />} />
            <Route
              path="exports/daily-food-history"
              element={<DailyFoodHistory />}
            />
            <Route
              path="inventory/import-medicines"
              element={<MedicineImportList />}
            />
            <Route path="customers" element={<CustomerManagement />} />

            <Route path="statistics/pigs" element={<PigStatistics />} />
            <Route
              path="statistics/inventory"
              element={<InventoryStatistics />}
            />
            <Route index element={<PerformanceStatistics />} />

            <Route
              path="health/vaccination-history"
              element={<VaccinationHistory />}
            />
            <Route
              path="health/medical-history"
              element={<HealthRecordHistory />}
            />

            {/* duyet phieu */}
            <Route
              path="import-medicines/pending"
              element={<MedicineRequestApproval />}
            />

            {/* import food */}
            <Route
              path="inventory/food-import-approval"
              element={<FoodImportApproval />}
            />
            <Route
              path="inventory/pending-requests"
              element={<PigImportApproval />}
            />

            <Route
              path="inventory/import-medicines/pending"
              element={<MedicineRequestApproval />}
            />

            <Route
              path="exports/request/list"
              element={<ExportRequestList />}
            />

            <Route path="exports/animals/list" element={<ExportList />} />

            <Route path="animals/pigs" element={<PigsManagement />} />
          </Route>

          <Route path="/dispatch" element={<DispatchLayout />}>
            <Route path="animals/move-house" element={<MoveHouse />} />
            <Route path="animals/pigs" element={<PigsManagement />} />
            <Route index element={<WeighingSchedule />} />
            <Route
              path="inventory/create-request"
              element={<PigImportRequest />}
            />
            <Route
              path="inventory/request-list"
              element={<ImportRequestManagement />}
            />
            <Route
              path="exports/animals/create"
              element={<CreateExportRequest />}
            />
          </Route>

          <Route path="/feed-manager" element={<FeedManagerLayout />}>
            <Route
              path="exports/daily-food-export"
              element={<DailyFoodExport />}
            />
            <Route
              path="exports/daily-food-history"
              element={<DailyFoodHistory />}
            />
            <Route
              path="inventory/import-foods/create"
              element={<FoodImport />}
            />
            <Route index element={<FoodImportList />} />
          </Route>

          <Route path="/Veterinarian" element={<VeterinarianLayout />}>
            <Route path="animals/dead" element={<DeadPigsPage />} />
            <Route
              index
              // path="health/medicine-schedule"
              element={<MedicineSchedule />}
            />
            <Route path="health/create" element={<CreateHealthRecordPage />} />
            <Route
              path="health/medical-history"
              element={<HealthRecordHistory />}
            />

            <Route
              path="import-medicines/create"
              element={<MedicineRequestPage />}
            />
            <Route
              path="import-medicines/list"
              element={<MedicineImportList />}
            />

            <Route
              path="inventory/import-medicines/create"
              element={<MedicineRequestPage />}
            />
            <Route
              path="inventory/import-medicines/list"
              element={<MedicineImportList />}
            />
            <Route
              path="health/vaccination/create"
              element={<VaccinationForm />}
            />
            <Route
              path="health/vaccination-history"
              element={<VaccinationHistory />}
            />
          </Route>

          <Route path="/Home" element={<HomePage />} />
          <Route path="/Auth" element={<AuthLayout />}>
            <Route path="Login" element={<LoginPage />} />
            <Route path="Forgot-Password" element={<ForgotPasswordPage />} />
            <Route path="Reset-Password" element={<ResetPasswordPage />} />
            <Route path="confirm-otp" element={<VerifyOTPPage />} />
          </Route>
          <Route path="profile" element={<Profile />} />
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/401" element={<Unauthorized />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
