interface DashboardPage {
  label: string;
  to: string;
}

export async function getDashboardPages(): Promise<DashboardPage[]> {
  return [
    {
      label: "Items",
      to: "/items",
    },
  ];
}
