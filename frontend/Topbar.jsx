
import "./topbar.scss"

export default function Topbar({menuOpen ,setMenuOpen}) {
    return (
        <div className={"topbar " + (menuOpen && "active")}>
                <div className="wrapper">
                        <div className="left">
                            <a href="#intro" className="logo">Home 3D</a>
                            <div className="itemContainer">
                                 
                                <span>Tutorials</span> 
                                <span>About</span>  
                                <span>Login</span>
                                <span>Signup</span>          
                            </div>
                            
                        </div>
                        <div className="right">
                                <div className="hamburger" onClick={()=>setMenuOpen(!menuOpen)}>
                                        <span className="line1"></span>
                                        <span className="line2"></span>
                                        <span className="line3"></span>
                                </div>
                        </div>
                        
                </div>
        </div>
    )
}
