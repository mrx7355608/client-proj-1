import { Section } from "./types";

export function paginateEquipments(sections: Section[], itemsPerPage: number) {
  const pages: any[] = [];
  let pageCount = 1;
  let page = {
    id: pageCount,
    sections: [] as any[],
  };

  let itemsRendered = 0;
  let currentSection = 0;

  while (currentSection < sections.length) {
    const section = sections[currentSection];

    if (section.equipment.length <= itemsPerPage - itemsRendered) {
      itemsRendered += section.equipment.length;
      page.sections.push({
        name: section.name,
        equipment: section.equipment,
      });
      currentSection++;
    } else if (section.equipment.length > itemsPerPage - itemsRendered) {
      const remainingItemsSpace = itemsPerPage - itemsRendered;
      const slicedEquipments = section.equipment.slice(0, remainingItemsSpace);
      itemsRendered += slicedEquipments.length;

      section.equipment = section.equipment.slice(remainingItemsSpace);

      page.sections.push({
        name: section.name,
        equipment: slicedEquipments,
      });
    }

    // Add existing page to pages array
    if (itemsRendered === itemsPerPage || currentSection === sections.length) {
      pages.push(page);
      pageCount++;
      itemsRendered = 0;

      // Reset page
      page = {
        id: pageCount,
        sections: [] as any[],
      };
    }
  }

  return pages;
}