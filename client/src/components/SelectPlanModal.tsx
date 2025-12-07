import { FC } from "react";

interface SelectPlanModalProps {
  onClose: () => void;
}

const SelectPlanModal: FC<SelectPlanModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl p-6 w-96 shadow-lg relative">
        <h2 className="text-xl font-semibold mb-4">Select a Plan</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You currently have no active subscription. Please choose a plan to continue.
        </p>

        {/* Example Plan Buttons */}
        <div className="flex flex-col gap-3">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Basic Plan
          </button>
          <button
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition"
          >
            Pro Plan
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SelectPlanModal;
