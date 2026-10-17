import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./Home/Home";
import Reservations from "./Service/Reservations";
import HoursAndLocations from "./Hours&Locations/Hours&Locations";
import Menu from "./Menu/Menu";

// Layout stays on screen for every page. Each child swaps into its Outlet.
const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "menu", element: <Menu /> },
      { path: "reservations", element: <Reservations /> },
      { path: "hours-and-locations", element: <HoursAndLocations /> },
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
