import {useEffect,useState } from "react";
import PortfolioList from '../portfolioList/PortfolioList';
import "./portfolio.scss"
import {
        featuredPortfolio,
        webPortfolio,
        mobilePortfolio,
        designPortfolio,
        contentPortfolio
        } from "../../data";

export default function Portfolio() {
    
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
        <div className="portfolio" id="portfolio">
                <h1>Top#5 Archietect</h1>
                <ul>
                        {
                            list.map((item) => (
                                <PortfolioList 
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
