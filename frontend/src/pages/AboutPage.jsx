import React from "react";
import Navbar from "../components/Navbar";

const AboutUs = () => {
    const gold = '#C5A357';
    const goldHover = '#b8954e';

    const mainStyle = {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: '#F8F9FA',
        color: '#333',
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '60px',
    };


    const containerStyle = {
        maxWidth: '1000px',
        margin: 'auto',
        padding: '40px 20px',
        backgroundColor: '#fff',
        flexGrow: 1,
    };

    const sectionStyle = {
        marginBottom: '40px',
    };

    const h2Style = {
        color: '#222',
        marginBottom: '15px',
        borderLeft: `5px solid ${gold}`,
        paddingLeft: '15px',
    };

    const pUlStyle = {
        lineHeight: 1.6,
        fontSize: '1.1rem',
    };

    const ulStyle = {
        paddingLeft: '20px',
    };

    const liStyle = {
        marginBottom: '10px',
    };

    const ctaStyle = {
        backgroundColor: '#000',
        color: '#fff',
        padding: '30px 20px',
        textAlign: 'center',
    };

    const ctaLinkStyle = {
        display: 'inline-block',
        margin: '10px',
        padding: '12px 24px',
        backgroundColor: gold,
        color: '#000',
        textDecoration: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
    };

    const ctaLinkHoverStyle = {
        backgroundColor: goldHover,
    };

    const footerStyle = {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#222',
        color: '#bbb',
        fontSize: '0.9rem',
    };

    // For simple hover on CTA buttons, use state and inline style toggling
    const [contactHover, setContactHover] = React.useState(false);
    const [bookHover, setBookHover] = React.useState(false);

    return (
        <main style={mainStyle}>

            <Navbar />

            <div style={containerStyle}>
                <div style={sectionStyle}>
                    <h2 style={h2Style}>Who We Are</h2>
                    <p style={pUlStyle}>
                        Your go-to luxury and event-oriented vehicle rental company is
                        ChauffeurLux. Whether you're organizing a spectacular matric dance
                        night, a bachelor or bachelorette party, a dream wedding, or any
                        other milestone celebration, we can offer classy and unique
                        transportation.
                    </p>
                </div>

                <div style={sectionStyle}>
                    <h2 style={h2Style}>What We Offer</h2>
                    <ul style={{ ...ulStyle, ...pUlStyle }}>
                        <li style={liStyle}>
                            <strong>Wedding Car Rentals:</strong> Stretch limousines, luxury
                            sedans, and classic vintage rides with professional chauffeurs.
                        </li>
                        <li style={liStyle}>
                            <strong>Bachelor & Bachelorette Parties:</strong> Party vans,
                            SUVs, and exotic cars perfect for group celebrations.
                        </li>
                        <li style={liStyle}>
                            <strong>Matric Dance Night Services:</strong> Arrive in
                            unforgettable fashion with premium vehicles tailored for your big
                            night.
                        </li>
                        <li style={liStyle}>
                            <strong>VIP Events & Celebrations:</strong> For red carpet events,
                            anniversaries, and more—with full customization.
                        </li>
                        <li style={liStyle}>
                            <strong>Flexible Rental Packages:</strong> Hourly, daily, or
                            weekend options with add-ons like refreshments, decor, and more.
                        </li>
                    </ul>
                </div>

                <div style={sectionStyle}>
                    <h2 style={h2Style}>Why Choose Us?</h2>
                    <ul style={{ ...ulStyle, ...pUlStyle }}>
                        <li style={liStyle}>Luxury & Exotic Car Options</li>
                        <li style={liStyle}>Professional, Discreet Chauffeurs</li>
                        <li style={liStyle}>On-Time, Door-to-Door Service</li>
                        <li style={liStyle}>Immaculate Interiors & Presentation</li>
                        <li style={liStyle}>Easy Online Booking & 24/7 Support</li>
                    </ul>
                </div>

                <div style={sectionStyle}>
                    <h2 style={h2Style}>Our Mission</h2>
                    <p style={pUlStyle}>
                        Our mission is simple: to elevate your special moments with a
                        premium transportation experience that blends luxury, comfort, and
                        class.
                    </p>
                </div>
            </div>

            <div style={ctaStyle}>
                <h2>Let's Ride Together</h2>
                <p>
                    Your celebration deserves more than just a ride — it deserves LuxeDrive.
                </p>
                <a
                    href="#"
                    style={contactHover ? { ...ctaLinkStyle, ...ctaLinkHoverStyle } : ctaLinkStyle}
                    onMouseEnter={() => setContactHover(true)}
                    onMouseLeave={() => setContactHover(false)}
                >
                    Contact Us
                </a>
                <a
                    href="#"
                    style={bookHover ? { ...ctaLinkStyle, ...ctaLinkHoverStyle } : ctaLinkStyle}
                    onMouseEnter={() => setBookHover(true)}
                    onMouseLeave={() => setBookHover(false)}
                >
                    Book Now
                </a>
            </div>

            <footer style={footerStyle}>&copy; 2025 ChauffeurLux. All rights reserved.</footer>
        </main>
    );
};

export default AboutUs;
