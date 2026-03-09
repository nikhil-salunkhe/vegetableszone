import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import hero from "../assets/images/hero-vegetables.jpg";
import fresh from "../assets/images/fresh-veg.jpg";
import delivery from "../assets/images/delivery.jpg";
import organic from "../assets/images/organic.jpg";

const Home = () => {
    const navigate = useNavigate();
    return (
        <>

            <div className="home">

                {/* HERO SECTION */}
                <section className="hero">
                    <div className="hero-content">
                        <h1>Fresh Vegetables Delivered to Your Doorstep</h1>
                        <p>100% Fresh • Organic • Affordable Prices</p>
                        <button
                            className="hero-btn"
                            onClick={() => navigate("/vegetables")}
                        >
                            Shop Now
                        </button>
                    </div>
                    <img src={hero} alt="Fresh Vegetables" className="hero-img" />
                </section>

                {/* FEATURES */}
                <section className="features">
                    <div className="feature-card">
                        <img src={fresh} alt="Fresh Veggies" />
                        <h3>Farm Fresh</h3>
                        <p>Directly sourced from local farmers</p>
                    </div>

                    <div className="feature-card">
                        <img src={delivery} alt="Fast Delivery" />
                        <h3>Fast Delivery</h3>
                        <p>Same day & next day delivery available</p>
                    </div>

                    <div className="feature-card">
                        <img src={organic} alt="Organic Products" />
                        <h3>Organic</h3>
                        <p>No chemicals, 100% natural produce</p>
                    </div>
                </section>

                {/* CTA SECTION */}
                <section className="cta">
                    <h2>Eat Healthy, Live Healthy 🌿</h2>
                    <p>Order fresh vegetables today and stay fit</p>
                    <button
                        className="cta-btn"
                        onClick={() => navigate("/vegetables")}
                    >
                        Explore Vegetables
                    </button>
                </section>

            </div>


        </>
    );
};

export default Home;
