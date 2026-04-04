export default function GoogleMeetIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Red Top */}
      <path fill="#EA4335" d="M14 6H4C3.45 6 3 6.45 3 7v3.5h11V6z"/>
      {/* Blue Bottom */}
      <path fill="#4285F4" d="M14 18H4c-.55 0-1-.45-1-1v-3.5h11V18z"/>
      {/* Yellow Middle Block */}
      <rect fill="#FBBC04" x="3" y="10.5" width="13" height="3" />
      {/* Green Camera Polygon */}
      <path fill="#34A853" d="M16 15V9l5-4v14l-5-4z"/>
    </svg>
  );
}
