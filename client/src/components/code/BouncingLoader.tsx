const BouncingLoader = () => {
  return (
    <div className="flex items-center justify-center space-x-2 h-20">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`w-3 h-3 rounded-full bg-blue-500 animate-bounce`}
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </div>
  );
};

export default BouncingLoader;
