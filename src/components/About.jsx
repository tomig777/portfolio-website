import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about">
      <div className="about__container">
        <div className="about__content">
          <div className="about__text">
            <h2 className="about__title">About Me</h2>
            <p className="about__description">
              I'm a passionate full-stack developer with over 5 years of experience 
              creating digital solutions that make a difference. I love turning 
              complex problems into simple, beautiful, and intuitive designs.
            </p>
            <p className="about__description">
              When I'm not coding, you can find me exploring new technologies, 
              contributing to open-source projects, or sharing knowledge with 
              the developer community.
            </p>
            <div className="about__stats">
              <div className="stat">
                <span className="stat__number">50+</span>
                <span className="stat__label">Projects Completed</span>
              </div>
              <div className="stat">
                <span className="stat__number">5+</span>
                <span className="stat__label">Years Experience</span>
              </div>
              <div className="stat">
                <span className="stat__number">100%</span>
                <span className="stat__label">Client Satisfaction</span>
              </div>
            </div>
          </div>
          <div className="about__image">
            <div className="about__placeholder">
              <span>About Image</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
