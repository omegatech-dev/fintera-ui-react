import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

import Tabs from "../Tabs";
import Table from "../Table";
import Pagination from "../Pagination";
import Toggle from "../Toggle";
import SegmentedControl from "../SegmentedControl";

expect.extend(matchers);
afterEach(cleanup);

describe("Tabs", () => {
  const items = [
    { value: "resumen", label: "Resumen" },
    { value: "cronograma", label: "Cronograma" },
    { value: "pagos", label: "Pagos" },
  ];

  it("selects a tab on click", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="resumen" onChange={onChange} />);

    fireEvent.click(screen.getByRole("tab", { name: "Pagos" }));
    expect(onChange).toHaveBeenCalledWith("pagos");
  });

  it("moves selection with the arrow keys", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="cronograma" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole("tab", { name: "Cronograma" }), {
      key: "ArrowRight",
    });
    expect(onChange).toHaveBeenCalledWith("pagos");
  });
});

describe("Table", () => {
  it("exposes column headers and sort state", () => {
    render(
      <Table
        columns={[
          { key: "client", header: "Cliente" },
          { key: "amount", header: "Monto", sortable: true },
        ]}
        rows={[{ id: 1, client: "Milton", amount: 100 }]}
        getRowKey={(row) => row.id}
        sort={{ field: "amount", direction: "desc" }}
        onSortChange={() => {}}
      />
    );

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveAttribute("scope", "col");
    expect(headers[1]).toHaveAttribute("aria-sort", "descending");
    expect(screen.getByText("Milton")).toBeInTheDocument();
  });
});

describe("Pagination", () => {
  it("announces the current page and the visible range", () => {
    render(
      <Pagination
        page={2}
        pageCount={5}
        total={30}
        perPage={10}
        onPageChange={() => {}}
      />
    );

    expect(screen.getByText("Mostrando 11–20 de 30")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("windows the page numbers around the current page", () => {
    render(
      <Pagination page={8} pageCount={12} onPageChange={() => {}} />
    );

    expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "1" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "8" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});

describe("Toggle", () => {
  it("is a switch with the current state", () => {
    const onChange = vi.fn();
    render(<Toggle checked label="Correos" onChange={onChange} />);

    const toggle = screen.getByRole("switch", { name: "Correos" });
    expect(toggle).toHaveAttribute("aria-checked", "true");

    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(false);
  });
});

describe("SegmentedControl", () => {
  it("exposes the selected option as a checked radio", () => {
    render(
      <SegmentedControl
        options={[
          { value: "direct", label: "Directo" },
          { value: "bank", label: "Bancario" },
        ]}
        value="bank"
        onChange={() => {}}
      />
    );

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Bancario" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });
});
