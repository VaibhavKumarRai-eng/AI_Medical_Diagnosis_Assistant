import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Search, Filter, Calendar, Clock, PhoneCall, 
  Video, CheckCircle2, ShieldCheck, MapPin, Star, X, 
  MessageSquare, Sparkles, Stethoscope
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DoctorConsultation = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState({ date: '', slot: '', notes: '' });

  // Mock doctors database
  const doctors = [
    {
      id: 1,
      name: "Dr. Ramesh Patel",
      specialty: "General Physician",
      experience: "14 Years",
      rating: "4.9",
      reviews: "320",
      fee: "₹500",
      availability: "Online Now",
      hospital: "Aegis Health Clinic, Mumbai",
      image: "👨‍⚕️"
    },
    {
      id: 2,
      name: "Dr. Aisha Sharma",
      specialty: "Cardiologist",
      experience: "12 Years",
      rating: "4.8",
      reviews: "185",
      fee: "₹800",
      availability: "Available Tomorrow",
      hospital: "Metro Heart Care, Delhi",
      image: "👩‍⚕️"
    },
    {
      id: 3,
      name: "Dr. Sarah Jenkins",
      specialty: "Dermatologist",
      experience: "8 Years",
      rating: "4.7",
      reviews: "140",
      fee: "₹600",
      availability: "Online Now",
      hospital: "Skin & Esthetics, Bangalore",
      image: "👩‍⚕️"
    },
    {
      id: 4,
      name: "Dr. Vijay Kulkarni",
      specialty: "Pediatrician",
      experience: "16 Years",
      rating: "4.9",
      reviews: "410",
      fee: "₹500",
      availability: "Available Today, 4:30 PM",
      hospital: "Children Welfare Clinic, Pune",
      image: "👨‍⚕️"
    },
    {
      id: 5,
      name: "Dr. Michael Chang",
      specialty: "Neurologist",
      experience: "18 Years",
      rating: "4.9",
      reviews: "290",
      fee: "₹1,000",
      availability: "Available Monday",
      hospital: "Apollo Brain Institute, Chennai",
      image: "👨‍⚕️"
    },
    {
      id: 6,
      name: "Dr. Priya Nair",
      specialty: "General Physician",
      experience: "10 Years",
      rating: "4.6",
      reviews: "98",
      fee: "₹400",
      availability: "Online Now",
      hospital: "Primary Care Plus, Cochin",
      image: "👩‍⚕️"
    }
  ];

  const specialties = ['All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist'];

  // Filtering Logic
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleOpenBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingConfirmed(false);
    setAppointmentDetails({ date: '2026-08-01', slot: '10:30 AM', notes: 'Consulting regarding symptom model suggestions.' });
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingConfirmed(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-left space-y-10 relative">
      
      {/* Title */}
      <div className={`border-b ${isLight ? 'border-gray-200' : 'border-white/[0.06]'} pb-5`}>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-3xl font-extrabold flex items-center gap-3 ${isLight ? 'text-[#1A1A1A]' : 'text-white'}`}
        >
          <div className="p-2.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 shadow-premium-sm">
            <Stethoscope className="h-6 w-6 text-brand-500" />
          </div>
          Doctor Consultation
        </motion.h1>
        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'} mt-2.5 max-w-xl leading-relaxed`}>
          Connect with professional clinical specialists to discuss symptom tracker results. Review schedules and book simulated tele-health video consultations.
        </p>
      </div>

      {/* Warning Alert stating it is a mock/college project demo */}
      <div className="bg-[#EEF0FF] dark:bg-white/[0.02] border border-brand-500/20 p-5 rounded-3xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-med-accent animate-pulse shrink-0" />
          <span className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-300'} leading-relaxed font-medium`}>
            <b>College Project Notice:</b> This portal displays mock doctor listings. Booking slots and video rooms represent simulated interfaces designed to demonstrate a clinic scheduling ecosystem.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            placeholder="Search by doctor name or clinic location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-10.5 w-full px-4 py-2.5 text-xs focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Specialty Filter Scroll */}
        <div className="md:col-span-6 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter className="h-4 w-4 text-gray-400 shrink-0 hidden sm:block" />
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all shrink-0 cursor-pointer ${
                selectedSpecialty === spec
                  ? 'bg-brand-500 border-brand-500 text-white shadow-premium-sm'
                  : isLight 
                    ? 'border-gray-200 text-gray-600 hover:bg-gray-50' 
                    : 'border-white/5 text-gray-400 hover:bg-white/5'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredDoctors.map(doctor => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={doctor.id}
            className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:shadow-premium-md transition-all duration-300 relative group"
          >
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-3xl">
                  {doctor.image}
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isLight ? 'text-[#1A1A1A]' : 'text-white'} font-poppins flex items-center gap-1.5`}>
                    {doctor.name}
                  </h3>
                  <p className="text-[11px] font-bold text-brand-500 font-poppins uppercase tracking-wider mt-0.5">{doctor.specialty}</p>
                </div>
              </div>

              {/* Badges / Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/[0.04] text-center">
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">Exp</p>
                  <p className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{doctor.experience}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">Rating</p>
                  <p className="text-xs font-bold text-yellow-500 flex items-center justify-center gap-0.5">
                    <Star className="h-3 w-3 fill-current text-yellow-500" /> {doctor.rating}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">Fee</p>
                  <p className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{doctor.fee}</p>
                </div>
              </div>

              {/* Clinic details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{doctor.hospital}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${doctor.availability.includes('Online') ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${doctor.availability.includes('Online') ? 'text-emerald-500' : 'text-blue-400'}`}>
                    {doctor.availability}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Book Button */}
            <div className="mt-6">
              <button
                onClick={() => handleOpenBooking(doctor)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-all cursor-pointer shadow-premium-sm hover:shadow-premium-md"
              >
                <Calendar className="h-4 w-4" /> Book Appointment
              </button>
            </div>
          </motion.div>
        ))}

        {filteredDoctors.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white/5 border border-white/[0.04] rounded-3xl">
            <p className="text-sm text-gray-500">No doctors match your query. Try selecting a different specialty category.</p>
          </div>
        )}
      </div>

      {/* Interactive Booking Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoctor(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative max-w-md w-full rounded-[32px] p-6 shadow-2xl overflow-hidden text-left border ${
                isLight ? 'bg-white border-gray-100' : 'bg-[#0F172A] border-white/10'
              }`}
            >
              {/* Top Banner decoration */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 to-med-accent" />
              
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full hover:bg-white/5 text-gray-500 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>

              {!bookingConfirmed ? (
                <>
                  <div className="text-center pb-4">
                    <h3 className={`text-lg font-bold ${isLight ? 'text-[#1A1A1A]' : 'text-white'} font-poppins`}>Consultation Scheduler</h3>
                    <p className="text-[11px] text-gray-500 mt-1">Book a video slot with {selectedDoctor.name}</p>
                  </div>

                  <form className="space-y-4" onSubmit={handleConfirmBooking}>
                    {/* Specialty Indicator */}
                    <div className="bg-brand-500/[0.04] p-3.5 rounded-2xl flex items-center gap-3 border border-brand-500/10">
                      <div className="text-2xl">{selectedDoctor.image}</div>
                      <div>
                        <p className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-gray-200'} font-poppins`}>{selectedDoctor.name}</p>
                        <p className="text-[9px] font-bold text-brand-500 uppercase tracking-wider">{selectedDoctor.specialty} ({selectedDoctor.fee})</p>
                      </div>
                    </div>

                    {/* Choose Date */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Appointment Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input 
                          type="date" 
                          required
                          value={appointmentDetails.date}
                          onChange={(e) => setAppointmentDetails({...appointmentDetails, date: e.target.value})}
                          className="glass-input pl-10 w-full py-2.5 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Choose Slot */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available Time Slots</label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <select 
                          value={appointmentDetails.slot}
                          onChange={(e) => setAppointmentDetails({...appointmentDetails, slot: e.target.value})}
                          className="glass-input pl-10 w-full py-2.5 text-xs font-semibold appearance-none"
                        >
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:30 AM">10:30 AM (Recommended)</option>
                          <option value="01:30 PM">01:30 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Patient Notes */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consultation Notes / Symptoms</label>
                      <textarea
                        rows="3"
                        placeholder="Briefly describe your symptoms or share findings..."
                        value={appointmentDetails.notes}
                        onChange={(e) => setAppointmentDetails({...appointmentDetails, notes: e.target.value})}
                        className="glass-input w-full p-3 text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition-all cursor-pointer shadow-premium-md mt-6"
                    >
                      <ShieldCheck className="h-4 w-4" /> Confirm Mock Booking
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 space-y-6">
                  <div className="mx-auto h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 shadow-premium-md">
                    <CheckCircle2 className="h-10 w-10 animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <h3 className={`text-xl font-bold ${isLight ? 'text-[#1A1A1A]' : 'text-white'} font-poppins`}>Booking Confirmed!</h3>
                    <p className="text-xs text-gray-500">Your mock telemedicine appointment has been created successfully.</p>
                  </div>

                  {/* Summary Box */}
                  <div className="glass-panel p-4.5 rounded-2xl border border-emerald-500/20 text-left space-y-2 bg-emerald-500/[0.02]">
                    <p className="text-xs"><b>Practitioner:</b> {selectedDoctor.name}</p>
                    <p className="text-xs"><b>Scheduled Slot:</b> {appointmentDetails.date} at {appointmentDetails.slot}</p>
                    <p className="text-xs"><b>Channel:</b> Aegis Secure Virtual Consultation Room</p>
                    <p className="text-[10px] text-gray-500 italic mt-2">Notes: {appointmentDetails.notes || 'N/A'}</p>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert("Starting Telehealth room simulator (B.Tech College Project demo)."); }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all cursor-pointer shadow-premium-md"
                    >
                      <Video className="h-4 w-4" /> Start Simulated Room
                    </a>
                    <button
                      onClick={() => setSelectedDoctor(null)}
                      className={`w-full py-2.5 text-xs font-semibold rounded-2xl border transition-all ${
                        isLight ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-white/5 text-gray-400 hover:bg-white/5'
                      }`}
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DoctorConsultation;
