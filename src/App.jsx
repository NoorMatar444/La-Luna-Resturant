import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./Home/Home";
import Reservations from "./Service/Reservations";
import HoursAndLocations from "./Hours&Locations/Hours&Locations";
import Menu from "./Menu/Menu";
import SignIn from "./Auth/SignIn";
import SignUp from "./Auth/SignUp";
import ConfirmEmail from "./Auth/ConfirmEmail";
import OrderSuccess from "./Orders/OrderSuccess";

// Layout stays on screen for every page. Each child swaps into its Outlet.
const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "menu", element: <Menu /> },
      { path: "orders/success", element: <OrderSuccess /> },
      { path: "reservations", element: <Reservations /> },
      { path: "hours-and-locations", element: <HoursAndLocations /> },
      { path: "signin", element: <SignIn /> },
      { path: "signup", element: <SignUp /> },
      { path: "confirm-email", element: <ConfirmEmail /> },
      { path: "*", element: <div>Page not found</div> },
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
