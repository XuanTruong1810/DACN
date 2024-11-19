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

function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/Home" element={<HomePage />} />
          <Route path="/Auth" element={<AuthLayout />}>
            <Route path="Login" element={<LoginPage />} />
            <Route path="Forgot-Password" element={<ForgotPasswordPage />} />
            <Route path="Reset-Password" element={<ResetPasswordPage />} />
            <Route path="confirm-otp" element={<VerifyOTPPage />} />
          </Route>
          <Route path="/Admin" element={<MainLayout />}>
            <Route path="Employees" element={<EmployeeManagement />} />
            <Route path="health/create" element={<CreateHealthRecordPage />} />
            <Route path="Suppliers" element={<SuppliersPage />} />
            <Route
              path="inventory/food-categories"
              element={<FoodCategoriesPage />}
            />
            <Route path="Areas" element={<AreasPage />} />
            <Route path="Houses" element={<HousesPage />} />
            <Route path="inventory/foods" element={<FoodsPage />} />

            <Route path="exports/create" element={<CreateExport />} />
            <Route
              path="exports/animals/create"
              element={<CreateExportRequest />}
            />
            <Route
              path="exports/request/list"
              element={<ExportRequestList />}
            />
            <Route path="exports/animals/list" element={<ExportList />} />
            {/* <Route path="exports/pigs" element={<ExportList />} /> */}
            <Route path="exports/daily-food" element={<DailyFoodExport />} />
            <Route path="DeadPigs" element={<DeadPigsPage />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="inventory">
              <Route path="pending-requests" element={<PigImportApproval />} />
              <Route path="create-request" element={<PigImportRequest />} />
              <Route
                path="request-list"
                element={<ImportRequestManagement />}
              />
            </Route>
            <Route path="animals">
              <Route path="dead" element={<DeadPigsPage />} />
              <Route path="pigs" element={<PigsManagement />} />
            </Route>
            <Route path="statistics">
              <Route path="pigs" element={<PigStatistics />} />
              <Route path="inventory" element={<InventoryStatistics />} />
              <Route path="performance" element={<PerformanceStatistics />} />
            </Route>
            <Route
              path="inventory/import-foods/create"
              element={<FoodImport />}
            />
            <Route
              path="inventory/food-import-approval"
              element={<FoodImportApproval />}
            />
            <Route
              path="inventory/import-foods/list"
              element={<FoodImportList />}
            />
          </Route>
          <Route path="profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
