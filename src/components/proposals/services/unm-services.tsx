export default function UNMServices() {
  const services = [
    "Collaborating with pre-existing or new ISP.",
    "Implementing network cabling using CAT6.",
    "Programming the Unified Management Appliance and Firewall, with configurations including Wireless VLAN tagging, internet throughput, DHCP and DNS protocols, port spanning, switch stacking, security installations, and traffic control.",
    "Handling the installation and positioning of Access Point, Cameras, Firewall, and Switch.",
    "Testing all installed hardware and programmed elements - Guest Wireless Access, Switch Ports, Cameras and the Unified Cloud Management System",
    "Overhauling the existing setup for a cleaner, more efficient configuration.",
    "Provide Bi-Weekly Maintenance on Firmware and Software updates on the Network system.",
    "Provide Standard IT support on trouble shooting any devices that have any network related issues.",
    "Proactive engagement with carrier in resolving low latency or internet disconnects.",
  ];

  return (
    <div className="proposal-page bg-white w-[8.5in] min-h-[11in] mx-auto p-[0.75in] shadow-lg relative mt-8">
      <h2 className="text-3xl font-bold text-gray-900">Service Fees</h2>
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-2 bg-white rounded-lg"
            >
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
              <p className="text-gray-700">{service}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
