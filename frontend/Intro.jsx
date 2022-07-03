import "./intro.scss";
import {init} from "ityped";
import { useEffect,useRef } from "react";

export default function Intro() {

    const textRef = useRef();

    useEffect(() => {

        init(textRef.current,{
            showCursor:true,
            backDelay:1500,
            backSpeed:60,
            strings:["Your Home","Buildings","Flat Design"],
        });
},[]);
    return (
        <div className="intro" id="intro">
            <div className="left">
                    <div className="imgContainer">
                            <img src="assets/home.png" alt=""/>
                    </div>
            </div>
            <div className="right">
                    <div className="wrapper">
                          
                            
                            <button href="#" class="button">Click here</button>
                         
                            <h3>To Create <span ref={textRef}></span></h3>
                    </div>
                    <a href="#portfolio">
                        <img src="assets/down.png" alt="ooooo"/>
                    </a>
            </div>
        </div>
    )
}
