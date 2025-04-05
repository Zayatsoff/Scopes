import { useState, useRef } from "react"
import { findNodeHandle, UIManager } from "react-native"

export const useCitySelector = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [selectedCity, setSelectedCity] = useState("Ottawa")
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const cityTextRef = useRef<any>(null)

  // Function to measure and show dropdown
  const measureAndShowDropdown = () => {
    if (cityTextRef.current && findNodeHandle(cityTextRef.current)) {
      UIManager.measure(
        findNodeHandle(cityTextRef.current) as number,
        (x, y, width, height, pageX, pageY) => {
          setDropdownPosition({
            top: pageY + height,
            left: pageX,
            width: width
          });
          setDropdownVisible(true);
        }
      );
    } else {
      // Fallback if measurement fails - position near the top of the screen
      setDropdownPosition({
        top: 120,
        left: 20,
        width: 200
      });
      setDropdownVisible(true);
    }
  };

  // Handle city selection and close dropdown
  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setDropdownVisible(false)
  }

  // Close the dropdown
  const closeDropdown = () => {
    setDropdownVisible(false)
  }

  return {
    cityTextRef,
    selectedCity,
    dropdownVisible,
    dropdownPosition,
    measureAndShowDropdown,
    handleCitySelect,
    closeDropdown
  }
} 