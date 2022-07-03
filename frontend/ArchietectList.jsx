import "./archietectList.css"

export default function ArchietectList({id,title, active, setSelected}) {
    return (
        <li className = {active ? "archietect active" : "archietectList"}
            onClick={() => setSelected(id)}
        >
            {title}            
        </li>
    )
}
