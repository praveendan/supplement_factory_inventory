import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '../dashboard/Dashboard';
import LogSales from '../log_sales/LogSales';
import SignIn from '../sign_in/SignIn';


const routes = (isAutheticated) =>[
    {
      path: 'app',
      element: isAutheticated ? <DashboardLayout /> : <Navigate to="/login" />,
      children: [
        { path: 'logSales', element: <LogSales /> },
      ]
    },
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { path: 'login', element: <LoginView /> },      
      ]
    },
]

//   const routes = (isAutheticated) =>[
//   {
//     path: 'app',
//     element: isAutheticated ? <DashboardLayout /> : <Navigate to="/login" />,
//     children: [
//       { path: 'customers', element: <CustomerListView /> },
//       { path: 'customers/assignTyre/:id', element: <AssignTyreView /> },
//       { path: 'customers/addUser', element: <AddUserView /> },
//       { path: 'products', element: <ProductListView /> },
//       { path: 'products/singleProduct', element: <SingleProductView /> },
//       { path: 'settings', element: <SettingsView /> },
//       { path: '*', element: <Navigate to="/404" /> }
//     ]
//   },
//   {
//     path: '/',
//     element: <MainLayout />,
//     children: [
//       { path: 'login', element: <LoginView /> },
//       { path: 'register', element: <RegisterView /> },
//       { path: '404', element: <NotFoundView /> },
//       { path: '/', element: <Navigate to="/app/customers" /> },
//       { path: '*', element: <Navigate to="/404" /> },
      
//     ]
//   },
//   {
//   path: '/account2',
//   element: <MainLayout/>,
//   children: [
//     { path: 'login2', element: <Login /> },
//     { path: 'changePassword', element: <ChangePassword />}
//   ]
//}

//];

export default routes;
