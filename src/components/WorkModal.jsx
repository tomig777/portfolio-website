import React, { useEffect } from 'react';
import './WorkModal.css';
import StarBorder from './StarBorder';
import cardImage from '../assets/card-1.jpeg';

const WorkModal = ({ workId, onClose }) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className="work-modal-overlay" onClick={onClose}>
      <StarBorder
        as="div"
        className="work-modal-star-border"
        color="#b19eef"
            speed="8s"
        thickness={2}
      >
        <div className="work-modal-wrapper" onClick={(e) => e.stopPropagation()}>
          <div className="work-modal-content">
            <div className="work-modal-body">
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Work {workId}</h1>
            <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.1rem', opacity: 0.8 }}>
              This is the detail page for Work {workId}.
            </p>
            <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1rem', opacity: 0.7 }}>
              Press ESC or click outside to close
            </p>
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <img 
                src={cardImage} 
                alt={`Work ${workId} Preview`}
                style={{
                  maxWidth: '400px',
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>
            
            <div style={{ marginTop: '40px', maxWidth: '800px', textAlign: 'center', lineHeight: '1.8' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#b19eef' }}>Project Overview</h2>
              <p style={{ marginBottom: '20px' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p style={{ marginBottom: '20px' }}>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img 
                  src={cardImage} 
                  alt={`Work ${workId} Process Image`}
                  style={{
                    maxWidth: '300px',
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </div>
              
              <h2 style={{ fontSize: '2rem', marginTop: '40px', marginBottom: '20px', color: '#b19eef' }}>Design Process</h2>
              <p style={{ marginBottom: '20px' }}>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
              <p style={{ marginBottom: '20px' }}>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
              </p>
              
              <h2 style={{ fontSize: '2rem', marginTop: '40px', marginBottom: '20px', color: '#b19eef' }}>Technologies Used</h2>
              <p style={{ marginBottom: '20px' }}>
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
              </p>
              
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img 
                  src={cardImage} 
                  alt={`Work ${workId} Technology Image`}
                  style={{
                    maxWidth: '250px',
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </div>
              
              <p style={{ marginBottom: '20px' }}>
                Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
              </p>
              
              <h2 style={{ fontSize: '2rem', marginTop: '40px', marginBottom: '20px', color: '#b19eef' }}>Results & Impact</h2>
              <p style={{ marginBottom: '20px' }}>
                Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.
              </p>
              <p style={{ marginBottom: '20px' }}>
                Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img 
                  src={cardImage} 
                  alt={`Work ${workId} Results Image`}
                  style={{
                    maxWidth: '350px',
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                  }}
                />
              </div>
              
              <p style={{ marginBottom: '40px' }}>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
          </div>
          </div>
        </div>
      </StarBorder>
    </div>
  );
};

export default WorkModal;

