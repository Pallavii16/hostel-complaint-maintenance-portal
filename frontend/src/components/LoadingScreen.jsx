const LoadingScreen = ({ message = 'Loading experience...' }) => (
  <div className="loading-screen">
    <div className="spinner" />
    <p>{message}</p>
  </div>
);

export default LoadingScreen;







