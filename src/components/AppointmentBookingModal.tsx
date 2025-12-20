import React, { useState } from 'react';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBook: (data: BookingData) => void;
}

interface BookingData {
  service: string;
  customer: string;
  date: string;
  time: string;
  note: string;
  price: string;
  duration: string;
  depositDue: string;
  repeat: string;
  file?: File;
}

const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  onBook,
}) => {
  const [formData, setFormData] = useState<BookingData>({
    service: '',
    customer: '',
    date: '',
    time: '',
    note: '',
    price: '',
    duration: '',
    depositDue: '',
    repeat: 'Off',
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Sample customer data for dropdown
  const customers = [
    { id: 1, name: 'Mary Williams', email: 'mary@example.com' },
    { id: 2, name: 'Michelle Moore', email: 'michelle@example.com' },
    { id: 3, name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: 4, name: 'Emma Davis', email: 'emma@example.com' },
    { id: 5, name: 'Lisa Anderson', email: 'lisa@example.com' },
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook(formData);
    onClose();
  };

  const handleCustomerSelect = (customerName: string) => {
    setFormData({ ...formData, customer: customerName });
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Appointment</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            {/* Row 1: Service dropdown (span 2) | Customer search (1) */}
            <div className="form-group span-2">
              <label>Service</label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                required
              >
                <option value="">Select a service</option>
                <option value="facial">Facial Treatment</option>
                <option value="massage">Massage Therapy</option>
                <option value="haircut">Haircut & Styling</option>
                <option value="manicure">Manicure</option>
                <option value="pedicure">Pedicure</option>
              </select>
            </div>

            <div className="form-group">
              <label>Customer</label>
              <div className="customer-search-container">
                <input
                  type="text"
                  placeholder="Search customer..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  required
                />
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="customer-dropdown">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="customer-option"
                        onClick={() => handleCustomerSelect(customer.name)}
                      >
                        <div className="customer-name">{customer.name}</div>
                        <div className="customer-email">{customer.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Date | Time | Note (span full width) */}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>

            <div className="form-group span-3">
              <label>Note</label>
              <textarea
                placeholder="Additional notes..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
              />
            </div>

            {/* Row 3: Price | Duration | File upload */}
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Duration (min)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>File Upload</label>
              <div className="file-upload-area">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, file });
                    }
                  }}
                />
                <span className="file-upload-text">Click to upload or drag and drop</span>
              </div>
            </div>

            {/* Row 4: Deposit Due | Repeat buttons */}
            <div className="form-group">
              <label>Deposit Due ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.depositDue}
                onChange={(e) => setFormData({ ...formData, depositDue: e.target.value })}
              />
            </div>

            <div className="form-group span-2">
              <label>Repeat</label>
              <div className="repeat-buttons">
                {['Off', 'Daily', 'Weekly', 'Monthly', 'Yearly'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`repeat-btn ${formData.repeat === option ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, repeat: option })}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="book-btn">
              Book Appointment
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        /* Modal backdrop */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          z-index: 1000;
        }

        /* Modal dialog */
        .modal-dialog {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 880px;
          margin: 20px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* Modal header */
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #666;
        }

        .close-button:hover {
          background: #f0f0f0;
        }

        /* Modal body */
        .modal-body {
          padding: 0;
          overflow: visible;
        }

        /* Form grid */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          padding: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.span-2 {
          grid-column: span 2;
        }

        .form-group.span-3 {
          grid-column: span 3;
        }

        .form-group label {
          font-weight: 500;
          margin-bottom: 8px;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          border: 1px solid #e0e0e0;
          padding: 10px;
          border-radius: 4px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #4caf50;
        }

        /* Customer search */
        .customer-search-container {
          position: relative;
        }

        .customer-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 10;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .customer-option {
          padding: 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
        }

        .customer-option:hover {
          background: #f8f8f8;
        }

        .customer-option:last-child {
          border-bottom: none;
        }

        .customer-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .customer-email {
          font-size: 12px;
          color: #666;
        }

        /* File upload */
        .file-upload-area {
          border: 2px dashed #e0e0e0;
          border-radius: 4px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .file-upload-area:hover {
          border-color: #4caf50;
        }

        .file-upload-area input[type="file"] {
          display: none;
        }

        .file-upload-text {
          color: #666;
          font-size: 14px;
        }

        /* Repeat buttons */
        .repeat-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .repeat-btn {
          padding: 8px 16px;
          border: 1px solid #ccc;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .repeat-btn:hover {
          border-color: #4caf50;
        }

        .repeat-btn.active {
          background: #4caf50;
          color: white;
          border-color: #4caf50;
        }

        /* Modal footer */
        .modal-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e0e0e0;
          background: #f8f8f8;
        }

        .cancel-btn,
        .book-btn {
          padding: 10px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: transparent;
          border: 1px solid #ccc;
          color: #666;
        }

        .cancel-btn:hover {
          border-color: #999;
          background: #f0f0f0;
        }

        .book-btn {
          background: #4caf50;
          color: white;
          border: 1px solid #4caf50;
        }

        .book-btn:hover {
          background: #45a049;
          border-color: #45a049;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.span-2,
          .form-group.span-3 {
            grid-column: span 1;
          }

          .modal-dialog {
            width: 95%;
            margin: 10px;
          }

          .repeat-buttons {
            justify-content: center;
          }

          .modal-footer {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .modal-backdrop {
            align-items: flex-start;
            padding-top: 20px;
          }

          .modal-dialog {
            margin: 0;
            border-radius: 0;
            height: 100vh;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AppointmentBookingModal;