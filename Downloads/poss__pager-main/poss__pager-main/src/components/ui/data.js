// --- IMPORT IMAGES (Relative path from src/components/ui/) ---

// STARTERS (Checked against your screenshot)
import paneerTikka from './images/starters/paneer-tikka.jpg';   // Hyphen (-)
import springRolls from './images/starters/spring_rolls.jpg';   // Underscore (_)
import chickenWings from './images/starters/chicken_wings.jpg'; // Underscore (_)
import frenchFries from './images/starters/french_fries.jpg';   // Underscore (_)

// MAIN COURSE (Checked against your screenshot)
import butterChicken from './images/main_course/butter_chicken.jpg';       // Underscore (_)
import dalMakhani from './images/main_course/dal_makhani.jpg';           // Underscore (_)
import paneerButterMasala from './images/main_course/paneer_butter_masala.jpg'; // Underscore (_)
import chickenBiryani from './images/main_course/chicken_biryani.jpg';   // Underscore (_)
import naan from './images/main_course/naan.jpg';
import roti from './images/main_course/roti.jpg';

// BEVERAGES (Checked against your screenshot)
import coldCoffee from './images/beverages/cold_coffee.jpg';  // Underscore (_)
import lassi from './images/beverages/lassi.jpg';
import lemonSoda from './images/beverages/lemon_soda.jpg';    // Underscore (_)

// --- MENU DATA ---
export const MENU_ITEMS = {
  Starters: [
    { id: 1, name: 'Paneer Tikka', price: 180, image: paneerTikka },
    { id: 2, name: 'Spring Rolls', price: 120, image: springRolls },
    { id: 3, name: 'Chicken Wings', price: 220, image: chickenWings },
    { id: 4, name: 'French Fries', price: 80, image: frenchFries },
  ],
  'Main Course': [
    { id: 10, name: 'Butter Chicken', price: 280, image: butterChicken },
    { id: 11, name: 'Dal Makhani', price: 180, image: dalMakhani },
    { id: 12, name: 'Paneer Butter Masala', price: 240, image: paneerButterMasala },
    { id: 14, name: 'Chicken Biryani', price: 260, image: chickenBiryani },
    { id: 15, name: 'Naan', price: 40, image: naan },
    { id: 16, name: 'Roti', price: 20, image: roti },
  ],
  Beverages: [
    { id: 18, name: 'Cold Coffee', price: 120, image: coldCoffee },
    { id: 19, name: 'Lassi', price: 80, image: lassi },
    { id: 20, name: 'Lemon Soda', price: 60, image: lemonSoda },
  ],
};

export const CATEGORIES = Object.keys(MENU_ITEMS);

export const UPI_CONFIG = {
  pa: 'mridulbhardwaj13@okaxis', 
  pn: 'Grid Sphere',             
  cu: 'INR',                     
};