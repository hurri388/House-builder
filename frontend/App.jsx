import Topbar from './components/topbar/Topbar';
import Intro from './components/intro/Intro';
import Archietect from './components/archietect/Archietect';
import Works from './components/works/Works';
import Testimonials from './components/testimonials/Testimonials';
import Feedback from './components/feedback/Feedback';
import "./app.scss";
import { useState } from 'react';
import Menu from './components/menu/Menu';
function App() {
  // this is for transitioning Hamburger 
  const [menuOpen,setMenuOpen] = useState(false)
  return (
    <div className="app">
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>
      <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>
      <div className="sections">
                
              <Intro/>
              <Archietect/>
              <Works/>
              <Testimonials/>
              <Feedback/>

      </div>
    </div>
  );
}

export default App;
