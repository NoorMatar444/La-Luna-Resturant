import {
  Navbar as FlowbiteNavbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { Link as RouterLink, useLocation } from "react-router-dom";

export function Navbar() {
  // Used to mark the link that matches the page the guest is on.
  const { pathname } = useLocation();

  return (
    <FlowbiteNavbar
      fluid
      rounded
      className="bg-[#14233c]"
      theme={{
        // Override Flowbite's default blue so active links stay cream on the navy bar.
        link: {
          active: {
            on: "bg-transparent text-white md:bg-transparent md:text-white",
            off: "border-0 text-[#f4e1b5] hover:bg-transparent hover:text-white md:border-0 md:text-[#f4e1b5] md:hover:bg-transparent md:hover:text-white",
          },
        },
      }}
    >
      <NavbarBrand>
        <span className="self-center whitespace-nowrap text-xl font-semibold text-[#f4e1b5]">
          La Luna Restaurant
        </span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        {/* RouterLink keeps clicks inside the app instead of reloading the page. */}
        <NavbarLink as={RouterLink} to="/" active={pathname === "/"}>
          Home
        </NavbarLink>
        <NavbarLink as={RouterLink} to="/menu" active={pathname === "/menu"}>
          Menu
        </NavbarLink>
        <NavbarLink as={RouterLink} to="/reservations" active={pathname === "/reservations"}>
          Reservations
        </NavbarLink>
        <NavbarLink as={RouterLink} to="/hours-and-locations" active={pathname === "/hours-and-locations"}>
          Hours&Locations
        </NavbarLink>
      </NavbarCollapse>
    </FlowbiteNavbar>
  );
}
