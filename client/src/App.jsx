import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GlobalStyle from "./styles/GlobalStyle";

import AuthLayout from "./pages/Auth/AuthLayout";
import LoginPage from "./pages/Auth/page/LoginPage";
import ForgotPasswordPage from "./pages/Auth/page/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/page/ResetPasswordPage";
import HomePage from "./pages/Home/page/HomePage";
import VerifyOTPPage from "./pages/Auth/page/VerifyOTPPage";
import MainLayout from "./pages/Admin/MainLayout";
import CreateHealthRecordPage from "./pages/Admin/page/CreateHealthRecordPage";
import SuppliersPage from "./pages/Admin/page/Suppliers/SuppliersPage";
import FoodCategoriesPage from "./pages/Admin/page/FoodCategories/FoodCategoriesPage";
import AreasPage from "./pages/Admin/page/Areas/AreasPage";
import HousesPage from "./pages/Admin/page/Houses/HousesPage";
import FoodsPage from "./pages/Admin/page/Foods/FoodsPage";
import CreateExport from "./pages/Admin/page/Exports/CreateExport";
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
import WeighingSchedule from "./pages/Admin/Schedule/WeighingSchedule";
import FoodExport from "./pages/Admin/FoodManagement/FoodExport";
import MoveHouse from "./pages/Admin/page/Animals/MoveHouse";
import MedicinePage from "./pages/Admin/Medicine/MedicinePage";
import MedicineRequestPage from "./pages/Admin/Medicine/MedicineRequestPage";
import MedicineRequestApproval from "./pages/Admin/Medicine/MedicineRequestApproval ";
import MedicineImportList from "./pages/Admin/Medicine/MedicineImportList";
import MedicineSchedule from "./pages/Admin/MedicineSchedule/MedicineSchedule";
import VaccinationForm from "./pages/Admin/Health/VaccinationForm";
import Restore from "./pages/Admin/Restore/Restore";
import { AuthProvider } from "./contexts/AuthContext";
import AdminLayout from "./pages/Admin/AdminLayout";
import FeedManagerLayout from "./pages/Admin/FeedManagerLayout";
import DispatchLayout from "./pages/Admin/DispatchLayout";
import VeterinarianLayout from "./pages/Admin/VeterinarianLayout";

function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/Admin" element={<AdminLayout />}>
            <Route index path="employees" element={<EmployeeManagement />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route
              path="inventory/food-categories"
              element={<FoodCategoriesPage />}
            />
            <Route path="restore" element={<Restore />} />
            <Route path="Areas" element={<AreasPage />} />
            <Route path="Houses" element={<HousesPage />} />
            <Route path="inventory/foods" element={<FoodsPage />} />
            <Route path="inventory/medicines" element={<MedicinePage />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="statistics">
              <Route path="pigs" element={<PigStatistics />} />
              <Route path="inventory" element={<InventoryStatistics />} />
              <Route path="performance" element={<PerformanceStatistics />} />
            </Route>

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

          <Route path="/Dispatch" element={<DispatchLayout />}>
            <Route path="animals/pigs" element={<PigsManagement />} />
            <Route index path="animals/move-house" element={<MoveHouse />} />
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

          <Route path="/FeedManagement" element={<FeedManagerLayout />}>
            <Route
              index
              path="exports/daily-food"
              element={<DailyFoodExport />}
            />
            <Route
              path="inventory/import-foods/create"
              element={<FoodImport />}
            />
            <Route
              path="inventory/import-foods/list"
              element={<FoodImportList />}
            />
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
          </Route>

          <Route path="/Home" element={<HomePage />} />
          <Route path="/Auth" element={<AuthLayout />}>
            <Route path="Login" element={<LoginPage />} />
            <Route path="Forgot-Password" element={<ForgotPasswordPage />} />
            <Route path="Reset-Password" element={<ResetPasswordPage />} />
            <Route path="confirm-otp" element={<VerifyOTPPage />} />
          </Route>
          <Route path="profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
