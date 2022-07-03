import "./menu.scss"

export default function Menu({menuOpen ,setMenuOpen}) {
    return (
        <div className={"menu "+(menuOpen && "active")}>
            <ul>
                <li onClick={()=>setMenuOpen(!menuOpen)}>
                    <a href="#intro">Home</a>
                </li>
                <li onClick={()=>setMenuOpen(!menuOpen)}>
                    <a href="#portfolio">Top#5 Archietects</a>
                </li>
                <li onClick={()=>setMenuOpen(!menuOpen)}>
                    <a href="#work">Trends</a>
                </li>
                <li onClick={()=>setMenuOpen(!menuOpen)}>
                    <a href="#testimonials">Testimonials</a>
                </li>
                <li onClick={()=>setMenuOpen(!menuOpen)}>
                    <a href="#contact">Feedback</a>
                </li>
            </ul>
        </div>
    )
}
