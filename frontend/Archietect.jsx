import {useEffect,useState } from "react";
import ArchietectList from '../archietectList/ArchietectList';
import "./archietect.scss"
import {
        
        contentPortfolio
        } from "../../data";

export default function Archietect() {
    
    const[selected, setSelected] = useState("featured");
    const[data, setData] = useState([]);
    
    const list = [
            {
            id:"ali",
            title:"Ali",
            },
            {
            id:"raza",
            title:"Raza",
            },
            {
            id:"shoaib",
            title:"Shoaib",
            },
            {
            id:"hurrairah",
             title:"Hurairah",
            },
            {
            id:"sami",
            title:"Sami",
            }
        ];

        useEffect(()=>{
                switch(selected){
                        case "ali":
                            setData(contentPortfolio);
                            break;

                        case "raza":
                            setData(contentPortfolio);
                            break;

                        case "shoaib":
                            setData(contentPortfolio);
                            break;
                        case "shoaib":
                            setData(contentPortfolio);
                            break;
                            
                        case "hurrairah":
                            setData(contentPortfolio);
                            break;
                        case "sami":
                            setData(contentPortfolio);
                            break;
                        
                        default:
                              setData(featuredPortfolio);
                                
                }
        },[selected])
    return (
        <div className="archietect" id="archietect">
                <h1>Top#5 Archietect</h1>
                <ul>
                        {
                            list.map((item) => (
                                <ArchietectList 
                                title={item.title}
                                active={selected === item.id}
                                setSelected={setSelected}
                                id={item.id}
                                />
                            ))

                        }
                </ul>
                        <div className="container">
                        {data.map(d=>(
                                <div className="item">
                                        <img src={d.img} alt=""/>
                                        <h3>{d.title}</h3>
                                </div>
                        ))}
                        
                        </div>
        </div>
       
    )
}
