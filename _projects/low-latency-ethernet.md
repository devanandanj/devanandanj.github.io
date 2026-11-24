---
title: "Low-latency 1G Ethernet"
order: 3
status: complete
when: "21 October 2026"
repo: "https://github.com/devanandanj/low-latency-1g-ethernet"
image: "https://raw.githubusercontent.com/devanandanj/low-latency-1g-ethernet/master/docs/latency.png"
description: "GMII to UDP payload in SystemVerilog with 0 added cycles. Simulation verified, Virtex-5 bring-up next. Front end for an ITCH feed handler."
---

## Purpose

- To be used in an ITCH 5.0 orderbook replication project.
- Target board : Xilinx Virtex-5 LX110T.

## Tools and technologies

- Xilinx Virtex-5 - GMII, 8 bit data @ 125 MHz
- Xilinx ISE
- System Verilog RTL
- cocotb 1.9.2 + Verilator 5.020 for verification
- Data feed from ITCH 5.0 Sample data (Not yet)

## FPGA board selection

- Being a student it is hard to acquire modern FPGA boards to learn. Borowing boards available in my college department lab was the only option.
- The only viable options available was Zedboard Rev C (Zynq XC7Z020) and Virtex-5 LX110T.
- Zed board's gigabit PHY is wired to the Zynq processing system and not the actual FPGA fabric. So every packet will pass through the ARM side controller before reaching the fabric. That adds latency which is unavoidable.
- Another option was to use a PMOD 100 mb ethernet module. I thought that was a good approach as i would get to use a modern board, but in reality the use of 100 mb ethernet introduced 10x the latency, incoming packets would be the bottleneck.

```console
1 Gb/s   : 8 ns per byte
100 Mb/s : 80 ns per byte
100-byte ITCH packet: ~0.8 us vs ~8 us just to arrive on the wire
```

- So the only option left was the Xilinx Virtex-5 board. Which in the sense was actual pain as I had to use old Xilinx ISE to generate bit stream.
- The practical experience of 1G ethernet outweighed the ISE pain. So the decision was set to use Xilinx Virtex-5.

## Design Decisions

- The CRC is at the end of the frame. Checking it first means holding every byte until the frame is over, so I don't. Bytes are forwarded as they arrive, the CRC runs alongside them, and `m_bad` gives the verdict at the end. If it is set, the consumer rolls back.
- My first MAC RX still cost 2 cycles. It held each byte back so it could mark the last one, because the end of a frame only shows up a cycle later, when `gmii_rx_dv` drops. Replacing `m_last` with a separate `m_eof` pulse removed the need to hold anything, and `m_data` became a wire from `gmii_rxd`.
- The parsers keep their header checks in flip-flops beside the stream. The data itself never passes through a register.
- Frames that aren't for us are dropped silently. Frames that turn out bad are flagged, because by then their bytes have already gone out.

## Result

```console
Logic, per payload byte         : 0 cycles
Wire, before first payload byte : 400 ns
Frame verdict (m_bad)           : 2 cycles after last byte
```

- The 400 ns is all wire: 8 bytes of preamble plus 42 bytes of headers at 8 ns per byte.

![m_valid rises on the first payload byte](https://raw.githubusercontent.com/devanandanj/low-latency-1g-ethernet/master/docs/latency.png)

## Verification

- 59 cocotb tests across 7 suites, running in CI.
- A same-cycle latency test through the whole chain. Adding one register makes it fail.
- I broke the design on purpose to prove the tests could fail.

## What's next

- It only runs in simulation so far. Next is bringing it up on the Virtex-5, which needs a PHY interface module and adds a cycle at the pins.
