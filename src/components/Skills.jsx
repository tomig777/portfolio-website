import React from 'react';
import './Skills.css';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Frontend',
      skills: [
        { name: 'React', level: 95 },
        { name: 'JavaScript', level: 90 },
        { name: 'TypeScript', level: 85 },
        { name: 'CSS/SCSS', level: 95 },
        { name: 'HTML', level: 98 }
      ]
    },
    {
      title: 'Backend',
      skills: [
        { name: 'Node.js', level: 90 },
        { name: 'Python', level: 85 },
        { name: 'Express', level: 88 },
        { name: 'MongoDB', level: 80 },
        { name: 'PostgreSQL', level: 75 }
      ]
    },
    {
      title: 'Tools & Others',
      skills: [
        { name: 'Git', level: 90 },
        { name: 'Docker', level: 75 },
        { name: 'AWS', level: 70 },
        { name: 'Figma', level: 85 },
        { name: 'Photoshop', level: 80 }
      ]
    }
  ];

  return (
    <section id="skills" className="skills">
      <div className="skills__container">
        <div className="skills__header">
          <h2 className="skills__title">Skills & Expertise</h2>
          <p className="skills__description">
            Here are the technologies and tools I work with to bring ideas to life.
          </p>
        </div>
        
        <div className="skills__grid">
          {skillCategories.map((category, index) => (
            <div key={index} className="skill-category">
              <h3 className="skill-category__title">{category.title}</h3>
              <div className="skill-category__skills">
                {category.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className="skill">
                    <div className="skill__header">
                      <span className="skill__name">{skill.name}</span>
                      <span className="skill__percentage">{skill.level}%</span>
                    </div>
                    <div className="skill__bar">
                      <div 
                        className="skill__progress" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
