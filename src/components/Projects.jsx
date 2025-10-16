import React, { useState } from 'react';
import './Projects.css';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const projects = [
    {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce solution with React, Node.js, and MongoDB. Features include user authentication, payment processing, and admin dashboard.',
      image: '/api/placeholder/400/300',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      category: 'web',
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 2,
      title: 'Mobile Banking App',
      description: 'A secure mobile banking application with biometric authentication and real-time transaction processing.',
      image: '/api/placeholder/400/300',
      technologies: ['React Native', 'Node.js', 'PostgreSQL', 'AWS'],
      category: 'mobile',
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 3,
      title: 'AI Chatbot',
      description: 'An intelligent chatbot powered by machine learning for customer support automation.',
      image: '/api/placeholder/400/300',
      technologies: ['Python', 'TensorFlow', 'Flask', 'OpenAI'],
      category: 'ai',
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 4,
      title: 'Portfolio Website',
      description: 'A modern, responsive portfolio website with smooth animations and interactive elements.',
      image: '/api/placeholder/400/300',
      technologies: ['React', 'CSS3', 'Framer Motion', 'Vite'],
      category: 'web',
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 5,
      title: 'Task Management App',
      description: 'A collaborative task management tool with real-time updates and team collaboration features.',
      image: '/api/placeholder/400/300',
      technologies: ['Vue.js', 'Socket.io', 'Express', 'MySQL'],
      category: 'web',
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 6,
      title: 'Fitness Tracker',
      description: 'A comprehensive fitness tracking mobile app with workout plans and progress tracking.',
      image: '/api/placeholder/400/300',
      technologies: ['React Native', 'Firebase', 'Chart.js', 'Redux'],
      category: 'mobile',
      liveUrl: '#',
      githubUrl: '#'
    }
  ];

  const filters = [
    { key: 'all', label: 'All Projects' },
    { key: 'web', label: 'Web Development' },
    { key: 'mobile', label: 'Mobile Apps' },
    { key: 'ai', label: 'AI/ML' }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeFilter);

  return (
    <section id="projects" className="projects">
      <div className="projects__container">
        <div className="projects__header">
          <h2 className="projects__title">My Projects</h2>
          <p className="projects__description">
            A showcase of my recent work and side projects that demonstrate my skills and creativity.
          </p>
        </div>

        <div className="projects__filters">
          {filters.map(filter => (
            <button
              key={filter.key}
              className={`filter-btn ${activeFilter === filter.key ? 'filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="projects__grid">
          {filteredProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-card__image">
                <div className="project-card__placeholder">
                  <span>{project.title}</span>
                </div>
                <div className="project-card__overlay">
                  <div className="project-card__links">
                    <a href={project.liveUrl} className="project-link" target="_blank" rel="noopener noreferrer">
                      <span>Live Demo</span>
                    </a>
                    <a href={project.githubUrl} className="project-link" target="_blank" rel="noopener noreferrer">
                      <span>GitHub</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="project-card__content">
                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__description">{project.description}</p>
                <div className="project-card__technologies">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
